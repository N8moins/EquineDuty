const prisma = require('../../prisma/client');
const {sendDetailedBill} = require('../emails/detailedReceiptMail');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const {getUserById} = require('../services/users.service');
const {generateDetailedReceipt} = require('./inscriptions.controller');

// Constants
const PERCENTAGE_TAKEN_ON_INSCRIPTION = 0.05;

/**
 * Pay inscription
 * @param {*} req request
 * @param {*} res response
 * @return {*} return client_secret or error
 */
async function payInscription(req, res) {
  try {
    const _user = await getUserById(req.user.id);
    if (!_user || _user === null || _user === undefined) {
      return res.status(404).json({error: 'User id not found'});
    }

    const inscription_id = parseInt(req.params.id);

    const relations = await prisma.inscriptions.findUnique({
      where: {
        id: inscription_id,
      },
      include: {
        show: {
          include: {
            organizer: {
              include: {
                StripeAccountUsers: true,
              },
            },
          },
        },
      },
    });

    if (!relations || relations === null || relations === undefined ||
      !relations.show.organizer || !relations.show.organizer.StripeAccountUsers
    ) {
      return res.status(500).json({
        message: 'Error processing payment request',
      });
    }

    if (relations.has_payed) {
      return res.status(409).json({message: 'Inscription already payed'});
    }

    const stripeAccountId =
      relations.show.organizer.StripeAccountUsers.stripe_account_id;

    const customer = await stripe.customers.create({
      name: _user.name,
      email: _user.email,
      metadata: {
        user_id: _user.id,
      },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      mode: 'payment',
      payment_method_types: [
        'card',
      ],
      // eslint-disable-next-line max-len
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      // eslint-disable-next-line max-len
      cancel_url: `${process.env.CLIENT_URL}/payment/error?session_id={CHECKOUT_SESSION_ID}`,
      line_items: [
        {
          price_data: {
            unit_amount: relations.total,
            currency: 'cad',
            product_data: {
              name: 'Inscription to ' + relations.show.name,
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount:
          Math.ceil(relations.total * PERCENTAGE_TAKEN_ON_INSCRIPTION),
        transfer_data: {
          destination: stripeAccountId,
        },
      },
      metadata: {
        user_id: _user.id,
        inscription_id: parseInt(req.params.id),
      },
    });

    res.json({'url': session.url});
  } catch (error) {
    res.status(500).json({message: 'Error processing payment request'});
  }
};

/**
 * Connect stripe to organizer
 * @param {*} req request
 * @param {*} res response
 * @return {*} return url or error
 */
async function connectStripe(req, res) {
  try {
    const userStripeAccountExists = await prisma.stripeAccountUsers.findUnique({
      where: {
        user_id: req.user.id,
      },
    });

    if (userStripeAccountExists) {
      return res.status(409).json({
        message: 'User already connected to stripe',
      });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      metadata: {
        user_id: req.user.id,
      },
    });

    // TODO: manage the case where the user doesn't finish the registration
    // (refresh_url)
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.ORGANIZER_URL}/stripe/reconnect`,
      return_url: `${process.env.ORGANIZER_URL}/stripe/connected`,
      type: 'account_onboarding',
    });

    res.json({url: accountLink.url});
  } catch (error) {
    res.status(500).json({message: error});
  }
}

/**
 * Webhook stripe
 * @param {*} req request
 * @param {*} res response
 * @return {*} return json or error
 */
async function webhook(req, res) {
  try {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
          req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      return res.status(400).json({message: `Webhook Error: ${err}`});
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSessionCompleted = event.data.object;

        await prisma.inscriptions.update({
          where: {
            id: parseInt(checkoutSessionCompleted.metadata.inscription_id),
          },
          data: {
            has_payed: true,
          },
        });

        const detailedRecipt = await generateDetailedReceipt(parseInt(
            checkoutSessionCompleted.metadata.inscription_id));
        const userInfo =
        await getUserById(parseInt(checkoutSessionCompleted.metadata.user_id));

        sendDetailedBill(userInfo.email,
            detailedRecipt, checkoutSessionCompleted.metadata.inscription_id);
        break;
      case 'account.updated':
        // TODO: What if user doesn't register the first time.
        const accountUpdated = event.data.object;

        if (accountUpdated.tos_acceptance.date === null) {
          break;
        }

        const _user_id = parseInt(accountUpdated.metadata.user_id);

        const userStripeAccountExists =
          await prisma.stripeAccountUsers.findUnique({
            where: {
              user_id: _user_id,
            },
          });

        if (userStripeAccountExists) {
          await prisma.stripeAccountUsers.update({
            where: {
              user_id: _user_id,
            },
            data: {
              stripe_account_id: accountUpdated.id,
            },
          });
          break;
        }

        await prisma.stripeAccountUsers.create({
          data: {
            user: {
              connect: {
                id: _user_id,
              },
            },
            stripe_account_id: accountUpdated.id,
          },
        });
        break;
      case 'checkout.session.expired':

        const inscription = await prisma.inscriptions.findUnique({
          where: {
            id: parseInt(event.data.object.metadata.inscription_id),
          },
        });

        await prisma.shows.update({
          where: {
            id: inscription.show_id,
          },
          data: {
            nb_free_place: {
              increment: 1,
            },
            nb_free_tack_stalls: {
              increment: inscription.nb_tack_stalls,
            },
            nb_free_temp_stalls: {
              increment: inscription.stall_type === 'TEMPORARY' ?
                inscription.nb_stalls : 0,
            },
            nb_free_permanent_stalls: {
              increment: inscription.stall_type === 'PERMANENT' ?
              inscription.nb_stalls : 0,
            },
          },
        });

        break;
      default:
        break;
    }
    res.json({received: true});
  } catch (error) {
    res.status(500).json({message: error});
  }
}

module.exports = {
  payInscription,
  connectStripe,
  webhook,
};
