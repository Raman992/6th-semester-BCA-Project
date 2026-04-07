import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, Account, Databases, Query } from 'appwrite';
import { useNavigate } from 'react-router-dom';

const AdminContext = createContext();

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const USER_PREFS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_PREFS_COLLECTION_ID;

  const checkAdminStatus = async () => {
    try {
      const user = await account.get();
      
      // Check admin status from preferences collection
      const prefsResult = await databases.listDocuments(
        DATABASE_ID,
        USER_PREFS_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );
      
      const userPrefs = prefsResult.documents[0];
      const isUserAdmin = userPrefs?.isAdmin === true;
      
      setIsAdmin(isUserAdmin);
      setAdminUser(user);
      return isUserAdmin;
    } catch (error) {
      console.log('No user logged in or admin check failed:', error);
      setIsAdmin(false);
      setAdminUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdmin = async (email, password) => {
    setChecking(true);
    try {
      // First, create session
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      
      // Check admin status from preferences
      const prefsResult = await databases.listDocuments(
        DATABASE_ID,
        USER_PREFS_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );
      
      const userPrefs = prefsResult.documents[0];
      
      if (userPrefs?.isAdmin === true) {
        setIsAdmin(true);
        setAdminUser(user);
        return { success: true };
      } else {
        // Not admin - log them out immediately
        await account.deleteSession('current');
        setIsAdmin(false);
        setAdminUser(null);
        return { success: false, error: 'Access denied. Admin privileges required.' };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: error.message || 'Invalid credentials' };
    } finally {
      setChecking(false);
    }
  };

  const logoutAdmin = async () => {
    try {
      await account.deleteSession('current');
      setIsAdmin(false);
      setAdminUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to set a user as admin (only call this from a secure backend/script)
  const setUserAsAdmin = async (userId, isAdmin = true) => {
    try {
      const prefsResult = await databases.listDocuments(
        DATABASE_ID,
        USER_PREFS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );
      
      if (prefsResult.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          USER_PREFS_COLLECTION_ID,
          prefsResult.documents[0].$id,
          { isAdmin }
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          USER_PREFS_COLLECTION_ID,
          ID.unique(),
          { userId, isAdmin }
        );
      }
      return true;
    } catch (error) {
      console.error('Error setting admin status:', error);
      return false;
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  return (
    <AdminContext.Provider value={{
      isAdmin,
      adminUser,
      loading,
      checking,
      loginAsAdmin,
      logoutAdmin,
      checkAdminStatus,
      setUserAsAdmin
    }}>
      {children}
    </AdminContext.Provider>
  );
};