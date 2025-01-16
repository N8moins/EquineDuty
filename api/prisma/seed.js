/* eslint no-unused-vars: 0 */
const prisma = require('./client');
const bcrypt = require('bcryptjs');

/**
 * Seed the database with some initial data
 * @return {Promise<void>}
 */
async function main() {
  const show = {id: 1};

  // Seed User
  const user = await prisma.users.create({
    data: {
      name: 'John Doe',
      email: 'user@email.com',
      phone: '123-456-7890',
      password: await bcrypt.hash('Password123!', 10),
      birthdate: new Date('1990-01-01'),
      role: 'USER',
      is_active: true,
      is_verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const admin = await prisma.users.create({
    data: {
      name: 'Mark Admio',
      email: 'admin@email.com',
      phone: '123-456-1234',
      password: await bcrypt.hash('Password123!', 10),
      birthdate: new Date('1990-01-01'),
      is_active: true,
      is_verified: true,
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const secretary = await prisma.users.create({
    data: {
      name: 'Astarion Ancunin',
      email: 'secretary@email.com',
      phone: '123-987-1231',
      password: await bcrypt.hash('Password123!', 10),
      birthdate: new Date('1990-01-01'),
      is_active: true,
      is_verified: true,
      role: 'SECRETARY',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const organizer = await prisma.users.create({
    data: {
      name: 'Lola Sapristi',
      email: 'organizer@email.com',
      phone: '123-987-1231',
      password: await bcrypt.hash('Password123!', 10),
      birthdate: new Date('1990-01-01'),
      is_active: true,
      is_verified: true,
      role: 'ORGANIZER',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.organizerShows.create({
    data: {
      remaining_shows: 100,
      user: {
        connect: {
          id: organizer.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.organizerShows.create({
    data: {
      remaining_shows: 100,
      user: {
        connect: {
          id: admin.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const address = await prisma.address.create({
    data: {
      street_address: '123 Main Street',
      province: 'Quebec',
      country: 'Canada',
      city: 'Montreal',
      zip_code: '12345',
      organizer: {
        connect: {
          id: organizer.id,
        },
      },
    }});

  await prisma.packages.create({
    data: {
      name: 'Bundle 1',
      description: 'Big and good bundle',
      tack_stalls: 2,
      stalls: 2,
      hays: 20,
      chiving: 20,
      price: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });


  const showFee = await prisma.shows_Fees.create({
    data: {
      hay: 50,
      chiving: 30,
      temp_stall_per_day: 10,
      permanent_stall_per_day: 15,
      tack_stall_per_day: 5,
      drug_test: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const administrationFee = await prisma.administration_Fees.create({
    data: {
      administration: 100,
      late_inscription: 20,
      cancel_inscription: 30,
      ground: 50,
      paramedics: 10,
      camper_ground_rental: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  for (let i = 0; i < 50; i++) {
    const startDate =
      getRandomDate(new Date('2023-01-01'), new Date('2025-01-01'));
    const endDate =
      getRandomDate(startDate, new Date('2026-12-31'));

    const show = await prisma.shows.create({
      data: {
        name: `Show ${i + 1}`,
        address: {
          connect: {
            id: address.id,
          },
        },
        organizer: {
          connect: {
            id: admin.id,
          },
        },
        nb_total_place: getRandomNumber(50, 200),
        nb_free_place: getRandomNumber(20, 100),
        nb_temp_stalls: getRandomNumber(5, 20),
        nb_permanent_stalls: getRandomNumber(5, 20),
        nb_tack_stalls: getRandomNumber(10, 30),
        nb_free_temp_stalls: getRandomNumber(5, 20),
        nb_free_permanent_stalls: getRandomNumber(5, 20),
        nb_free_tack_stalls: getRandomNumber(10, 30),
        show_fees: {
          connect: {
            id: showFee.id,
          },
        },
        administration_fee: {
          connect: {
            id: administrationFee.id,
          },
        },
        recognized_show: getRandomBoolean(),
        rules: 'Hello I am the rules!',
        start_date: startDate,
        end_date: endDate,
        is_vaccination_proof_required: getRandomBoolean(),
        is_coggins_proof_required: getRandomBoolean(),
        inscription_start_date:
          getRandomDate(new Date('2025-01-01'), startDate),
        inscription_end_date:
          getRandomDate(endDate, new Date('2026-12-31')),
        inscription_end_late_date:
          getRandomDate(endDate, new Date('2026-12-31')),
        is_published: getRandomBoolean(),
        secretary: {
          connect: {
            id: secretary.id,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
  const test = await prisma.tests.create({
    data: {
      number: 'AFG12',
      name: 'Basic Test',
      short_name: 'BD1',
      points_precision: 2,
      duration_minute: 5,
      nb_standard_marks: 3,
      nb_collectives_marks: 2,
      total_points_possibility: 100,
      user: {
        connect: {
          id: user.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const mark = await prisma.marks.create({
    data: {
      move_name: 'Jump',
      note: 8,
      type: 'STANDARD',
      coef_points: 2,
      test: {
        connect: {
          id: test.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const class1 = await prisma.classes.create({
    data: {
      number: 'Alloa',
      name: 'Jumping Class A',
      date: new Date('2024-02-01T10:00:00Z'),
      ring_name: 'Bell Center',
      ring_number: '12AB',
      price_entry: 50,
      show: {
        connect: {
          id: show.id,
        },
      },
      level_type: 'Training',
      is_test_of_choice: false,
      test: {
        connect: {
          id: test.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const class2 = await prisma.classes.create({
    data: {
      number: '1-1',
      name: 'Running Class A',
      date: new Date('2024-02-01T10:00:00Z'),
      ring_name: 'Baldurs Center',
      ring_number: '2K',
      price_entry: 50,
      show: {
        connect: {
          id: show.id,
        },
      },
      level_type: 'Training',
      is_test_of_choice: false,
      test: {
        connect: {
          id: test.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const class3 = await prisma.classes.create({
    data: {
      number: '1-2',
      name: 'Jumping Class B',
      date: new Date('2024-02-01T10:00:00Z'),
      ring_name: 'Potato Center',
      ring_number: 'B521',
      price_entry: 50,
      show: {
        connect: {
          id: show.id,
        },
      },
      level_type: 'Training',
      is_test_of_choice: false,
      test: {
        connect: {
          id: test.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const horse = await prisma.horses.create({
    data: {
      name: 'Thunder',
      sex: 'Male',
      no_fei: 'FEI123',
      no_micro_chip: 'MICROCHIP123',
      path_vaccine: '/path/to/vaccine_record.pdf',
      path_coggins: '/path/to/coggins_record.pdf',
      name_owner: 'Bob',
      fei_owner: 'FEI321',
      email_owner: 'Bob@gmail.com',
      phone_owner: '132-456-1254',
      user: {
        connect: {
          id: user.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const horse2 = await prisma.horses.create({
    data: {
      name: 'Electric',
      sex: 'Male',
      no_fei: 'FEI123',
      no_micro_chip: 'MICROCHIP123',
      path_vaccine: '/path/to/vaccine_record.pdf',
      path_coggins: '/path/to/coggins_record.pdf',
      name_owner: 'Bobby',
      fei_owner: 'FEI321',
      email_owner: 'obby@gmail.com',
      phone_owner: '132-456-1254',
      user: {
        connect: {
          id: user.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const horse3 = await prisma.horses.create({
    data: {
      name: 'Electric',
      sex: 'Male',
      no_fei: 'FEI123',
      no_micro_chip: 'MICROCHIP123',
      path_vaccine: '/path/to/vaccine_record.pdf',
      path_coggins: '/path/to/coggins_record.pdf',
      name_owner: 'Bobby',
      fei_owner: 'FEI321',
      email_owner: 'obby@gmail.com',
      phone_owner: '132-456-1254',
      user: {
        connect: {
          id: user.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const horse4 = await prisma.horses.create({
    data: {
      name: 'Electric',
      sex: 'Male',
      no_fei: 'FEI123',
      no_micro_chip: 'MICROCHIP123',
      path_vaccine: '/path/to/vaccine_record.pdf',
      path_coggins: '/path/to/coggins_record.pdf',
      name_owner: 'Bobby',
      fei_owner: 'FEI321',
      email_owner: 'obby@gmail.com',
      phone_owner: '132-456-1254',
      user: {
        connect: {
          id: user.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });


  const rider = await prisma.riders.create({
    data: {
      name: 'Jane Doe',
      phone: '123-456-7890',
      email: 'jane.doe@example.com',
      no_fei: 'FEI456',
      emergency_name: 'Emergency Contact',
      emergency_phone: '987-654-3210',
      stable_name: 'Stable ABC',
      trainer_name: 'Trainer XYZ',
      user: {
        connect: {
          id: 1,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const rider2 = await prisma.riders.create({
    data: {
      name: 'Max Doe',
      phone: '123-456-7890',
      email: 'max.doe@example.com',
      no_fei: 'FEI789',
      emergency_name: 'Emergency Contact',
      emergency_phone: '987-654-3210',
      stable_name: 'Stable ABC',
      trainer_name: 'Trainer XYZ',
      user: {
        connect: {
          id: 1,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const inscription = await prisma.inscriptions.create({
    data: {
      horse: {
        connect: {
          id: horse.id,
        },
      },
      rider: {
        connect: {
          id: rider.id,
        },
      },
      show: {
        connect: {
          id: show.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
      rider_entry_number: 1,
      no_fei: 'FEI123',
      nb_chiving_bags: 3,
      nb_stalls: 2,
      nb_tack_stalls: 1,
      nb_hay_bale: 5,
      nb_chiving_bags: 3,
      stall_type: 'PERMANENT',
      nb_days: 1,
      total: 100,
      has_payed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Shared Horse
  const inscription2 = await prisma.inscriptions.create({
    data: {
      horse: {
        connect: {
          id: horse.id,
        },
      },
      rider: {
        connect: {
          id: rider2.id,
        },
      },
      show: {
        connect: {
          id: show.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
      rider_entry_number: 2,
      no_fei: 'FEI123',
      nb_stalls: 2,
      nb_tack_stalls: 1,
      stall_type: 'PERMANENT',
      nb_chiving_bags: 3,
      nb_hay_bale: 5,
      nb_days: 1,
      total: 100,
      has_payed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Shared Rider
  const inscription3 = await prisma.inscriptions.create({
    data: {
      horse: {
        connect: {
          id: horse2.id,
        },
      },
      rider: {
        connect: {
          id: rider.id,
        },
      },
      show: {
        connect: {
          id: show.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
      rider_entry_number: 3,
      no_fei: 'FEI123',
      nb_stalls: 2,
      nb_tack_stalls: 1,
      nb_hay_bale: 5,
      rider_entry_number: 1,
      stall_type: 'PERMANENT',
      nb_chiving_bags: 3,
      nb_days: 1,
      total: 100,
      has_payed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const inscription4 = await prisma.inscriptions.create({
    data: {
      horse: {
        connect: {
          id: horse4.id,
        },
      },
      rider: {
        connect: {
          id: rider.id,
        },
      },
      show: {
        connect: {
          id: show.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
      rider_entry_number: 4,
      no_fei: 'FEI123',
      nb_stalls: 2,
      nb_hay_bale: 5,
      nb_tack_stalls: 1,
      rider_entry_number: 1,
      stall_type: 'PERMANENT',
      nb_days: 1,
      total: 100,
      nb_chiving_bags: 3,
      has_payed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const inscription5 = await prisma.inscriptions.create({
    data: {
      horse: {
        connect: {
          id: horse2.id,
        },
      },
      rider: {
        connect: {
          id: rider.id,
        },
      },
      show: {
        connect: {
          id: show.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
      rider_entry_number: 6,
      no_fei: 'FEI123',
      nb_stalls: 2,
      nb_hay_bale: 5,
      nb_tack_stalls: 1,
      stall_type: 'PERMANENT',
      nb_chiving_bags: 3,
      has_payed: true,
      nb_days: 1,
      total: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const class_inscription = await prisma.classes_Inscriptions.create({
    data: {
      class: {
        connect: {
          id: class1.id,
        },
      },
      inscription: {
        connect: {
          id: inscription.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const class_inscription2 = await prisma.classes_Inscriptions.create({
    data: {
      class: {
        connect: {
          id: class1.id,
        },
      },
      inscription: {
        connect: {
          id: inscription2.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const class_inscription3 = await prisma.classes_Inscriptions.create({
    data: {
      class: {
        connect: {
          id: class2.id,
        },
      },
      inscription: {
        connect: {
          id: inscription3.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const class_inscription4 = await prisma.classes_Inscriptions.create({
    data: {
      class: {
        connect: {
          id: class2.id,
        },
      },
      inscription: {
        connect: {
          id: inscription4.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const class_inscription5 = await prisma.classes_Inscriptions.create({
    data: {
      class: {
        connect: {
          id: class2.id,
        },
      },
      inscription: {
        connect: {
          id: inscription5.id,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const judges_Classes = await prisma.judges_Classes.create({
    data: {
      class: {
        connect: {
          id: class1.id,
        },
      },
      name: 'John Deer',
      ring_name: 'Bell Center',
      ring_position: 'H',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });


  const shows_aksed_code = await prisma.shows_Asked_Codes.create({
    data: {
      show: {
        connect: {
          id: show.id,
        },
      },
      asked_code_name: 'quebec_equestre',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const inscription_asked_codes = await prisma.inscriptions_Asked_Codes.create({
    data: {
      inscription: {
        connect: {
          id: inscription.id,
        },
      },
      code_name: 'quebec_equestre',
      code_value: '1342346',
    },
  });

  await prisma.shows_Packages.create({
    data: {
      show_id: 1,
      package_id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });


  await prisma.inscriptions_Packages.create({
    data: {
      inscription_id: 1,
      package_id: 1,
      nb_packages: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

/**
 * Get a random date between two dates
 * @param {*} start start date
 * @param {*} end end date
 * @return {Date} random date
 */
function getRandomDate(start, end) {
  return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

/**
 * Get a random number between min and max
 * @param {*} min minimum number
 * @param {*} max maximum number
 * @return {number} random number
 */
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
  * Get a random boolean
  * @return {boolean} random boolean
  */
function getRandomBoolean() {
  return Math.random() < 0.5;
}

main()
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
