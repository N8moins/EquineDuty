const fs = require('fs').promises;
const path = require('path');

module.exports = async () => {
  const directory = 'src/public/documents';

  const files = await fs.readdir(directory);

  for (const file of files) {
    try {
      if (file !== '.gitkeep') {
        await fs.unlink(path.join(directory, file));
      }
    } catch (error) {
    }
  }
};
