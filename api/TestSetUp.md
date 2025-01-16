# Set Up Des Tests

Documention pour comment mocker le Prisma.

## Service/Autre
Dans les fichiers qui utilise Prisma au lieu de créer un nouveau autre Prisma client pour le service, il faudrait utilisé celui dans le dossier prisma/client.js.
ex: const prisma = require('<path_folder>/prisma/client');

### Test

1. Importer prismaMock pour avoir le prisma de mock
  ex: const {prismaMock} = require('../../prisma/singleton.js');
2. Dans le test specifique que où le Prisma a besoin d'être mocker, mocker la fonction dont le service utilise
  ex: prismaMock.riders.create.mockResolvedValue(rider);


## Documentation package externe

- prisma test doc: https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing
- github code utilisé : https://github.com/OctobugDemo/nodejs-prisma-unit-test
