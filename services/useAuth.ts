import { USER_STORAGE_KEY } from '@/constant';
import { useEffect, useState } from 'react';
import { getData, removeData, storeData } from './storage';


export function useAuth() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserLogin();
  }, []);

  const checkUserLogin = async () => {
    try {
      const storedName = await getData(USER_STORAGE_KEY)
      setUserName(storedName);
    } catch (error) {
      console.error('Error checking user login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (name: string) => {
    try {
      await storeData(USER_STORAGE_KEY, name.trim());
      setUserName(name.trim());
      return true;
    } catch (error) {
      console.error('Error saving user name:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await removeData(USER_STORAGE_KEY);
      setUserName(null);
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      return false;
    }
  };

  return {
    userName,
    isLoading,
    login,
    logout,
  };
}