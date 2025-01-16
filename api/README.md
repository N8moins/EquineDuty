# Projet Equine Duty API

Documention pour le projet d'api Equine duty.

## Procédure de lancement du projet
Avant de commencer, assurez-vous d'avoir docker d'installer sur votre système.

Pour vérifier, taper la commande suivant dans votre terminal: `docker info`

### Pour lancer le projet

1. Ouvrer un terminal à l'emplacement du fichier docker-compose.yml
2. Entrer la commande suivante pour lancer le projet: `docker compose up -d`

## Documentation package externe

- express: https://expressjs.com/fr/4x/api.html
- bcrypt: https://github.com/kelektiv/node.bcrypt.js#readme
- body-parser: https://github.com/expressjs/body-parser#readme
- cookie-parser: https://github.com/expressjs/cookie-parser#readme
- dotenv: https://www.dotenv.org/docs/
- helmet: https://helmetjs.github.io/
- jsonwebtoken: https://self-issued.info/docs/draft-ietf-oauth-json-web-token.html
- moment: https://momentjs.com/docs/
- winston: https://github.com/winstonjs/winston?tab=readme-ov-file#readme
- eslint: https://eslint.org/docs/latest/
- eslint-config-google: https://github.com/google/eslint-config-google#readme
- supertest: https://github.com/ladjs/supertest#readme
- prisma: https://www.prisma.io/docs
- @prisma/client: https://www.prisma.io/docs/orm/prisma-client
- express-validaton: https://github.com/andrewkeig/express-validation

## Middleware pour authentifcation/routes protégées
#### Voir src/middlewares/validations/auth.validation.js
- useAuth, pour valider JWT (toujours utiliser en premier)
- isSameUser, compare le user du JWT comparé à le userId de la route
- isSecretaryOrMore, valide le role Secretary du JWT
- isOrganiserOrMore, valide le role Organizer du JWT
- isAdmin, valide le role Admin du JWT
- isSameOrganiserOrAdmin, valide que le l'organisateur est le même que dans le show


## Scripts de Développement
- ClearRestartDocker : Permets d'arrêter les containers, supprimer volumes, images et container et de redémarrer les containers.
    On peux ajouter l'option --migrate pour migrate la base de donnée par la suite. 

## Outils lors du déploiement
- Grafana : Permets de faire du monitoring sur son API. Pour y accéder, se connecter au port 3000. https://grafana.com/
    
