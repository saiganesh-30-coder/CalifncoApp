import process from 'node:process';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const projectId = 'califnco-app-e1266';
const adminEmail = 'admin@gmail.com';

async function assignAdminClaim() {
  const app = initializeApp({
    credential: applicationDefault(),
    projectId,
  });
  const auth = getAuth(app);
  const user = await auth.getUserByEmail(adminEmail);

  if (user.email?.toLowerCase() !== adminEmail) {
    throw new Error(`Firebase returned an unexpected account for ${adminEmail}.`);
  }

  await auth.setCustomUserClaims(user.uid, {
    ...user.customClaims,
    admin: true,
  });

  const updatedUser = await auth.getUser(user.uid);
  if (updatedUser.customClaims?.admin !== true) {
    throw new Error(`Failed to verify the admin claim for ${adminEmail}.`);
  }

  console.log(`User UID: ${user.uid}`);
  console.log(`Assigned and verified admin: true for ${adminEmail}.`);
  console.log('Sign out and back in to refresh the Firebase ID token.');
}

assignAdminClaim().catch((error) => {
  console.error('Could not assign the admin claim:', error.message);
  process.exitCode = 1;
});
