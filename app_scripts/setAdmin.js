import { Client, Databases, Users, ID, Query } from 'node-appwrite';
import 'dotenv/config';
import process from 'node:process';
// Use process.env instead of import.meta.env for Node scripts
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('69108293000bdc95e891') 
  .setKey('standard_7e3b8238c2768b3214acb6cdacb612c9107e2b28792409e1825a8b86ba36912fcca935fe6048d317fc3cc58e7854b010de7f9f4a3473ccac0732ec9efc4675c6fc26b800ffcd439fc4375ee5e8503dc2cf64f27599426e5816372b432ca4bef4d81ed7aa413de02354edf972f21e0f9611111c7c6c76011e49e878da24eceaea');

const databases = new Databases(client);
const users = new Users(client);

const DATABASE_ID = '6910836c0020e9426bf7';
const USER_PREFS_COLLECTION_ID = 'user_preferences';

async function setAdminUser(email) {
  try {
    console.log(`\n🔍 Looking up user: ${email}...\n`);

    // 1. Find user by email
    const userList = await users.list([
      Query.equal('email', email)
    ]);

    if (userList.total === 0) {
      console.log(`❌ No user found with email: ${email}`);
      return;
    }

    const user = userList.users[0];
    console.log(`✅ Found user: ${user.name || user.email} (${user.$id})`);

    // 2. Check if preferences exist
    const prefsResult = await databases.listDocuments(
      DATABASE_ID,
      USER_PREFS_COLLECTION_ID,
      [Query.equal('userId', user.$id)]
    );

    const now = new Date().toISOString();

    if (prefsResult.documents.length > 0) {
      // 3A. Update existing document
      await databases.updateDocument(
        DATABASE_ID,
        USER_PREFS_COLLECTION_ID,
        prefsResult.documents[0].$id,
        {
          isAdmin: true,
          updatedAt: now
        }
      );
      console.log(`🎉 ${email} is now an ADMIN (updated existing record)\n`);
    } else {
      // 3B. Create new document
      await databases.createDocument(
        DATABASE_ID,
        USER_PREFS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          isAdmin: true,
          createdAt: now,
          updatedAt: now
        }
      );
      console.log(`🎉 ${email} is now an ADMIN (created new record)\n`);
    }

  } catch (error) {
    console.error('\n❌ Error setting admin:\n');
    console.error(error.message || error);
  }
}

const email = process.argv[2];
if (!email) {
  console.log('\n❌ Missing email argument!\nUsage: node scripts/setAdmin.js <email>\n');
  process.exit(1);
}

setAdminUser(email);