import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, Account, Databases, Query } from 'appwrite';

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

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const user = await account.get();
      // Check if user has admin role (you can store this in preferences or a separate collection)
      const prefs = await account.getPrefs();
      if (prefs.isAdmin) {
        setIsAdmin(true);
        setAdminUser(user);
      }
    } catch (error) {
      console.log('No user logged in');
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdmin = async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      const prefs = await account.getPrefs();
      
      if (prefs.isAdmin) {
        setIsAdmin(true);
        setAdminUser(user);
        return { success: true };
      } else {
        await account.deleteSession('current');
        return { success: false, error: 'Not an admin account' };
      }
    } catch (error) {
      return { success: false, error: error.message };
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

  return (
    <AdminContext.Provider value={{
      isAdmin,
      adminUser,
      loading,
      loginAsAdmin,
      logoutAdmin
    }}>
      {children}
    </AdminContext.Provider>
  );
};