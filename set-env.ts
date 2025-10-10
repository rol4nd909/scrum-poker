const setEnv = () => {
  const fs = require('fs');
  const writeFile = fs.writeFile;

  // Configure Angular `environment.ts` file path
  const targetPath = './src/environments/environment.ts';

  require('dotenv').config({
    path: '.env',
  });

  // `environment.ts` file structure
  const envConfigFile = `export const environment = {
    production: true,
    firebase: {
      apiKey: '${process.env['FIREBASE_API_KEY']}',
      authDomain: 'bld-scrum-poker-app.firebaseapp.com',
      projectId: 'bld-scrum-poker-app',
      storageBucket: 'bld-scrum-poker-app.firebasestorage.app',
      messagingSenderId: '592488517219',
      appId: '1:592488517219:web:d9313ffc0c6e973c2d3256',
    }
  };
`;
  console.log('The file `environment.ts` will be written with the following content: \n');
  writeFile(targetPath, envConfigFile, (err: unknown) => {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(`Angular environment.ts file generated correctly at ${targetPath} \n`);
    }
  });
};

setEnv();
