import React, {useState} from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth';
import {auth} from '../firebaseconfig';
import { useAuth } from '../contexts/AuthContext';

const login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {currentUser} = useAuth();

  const  hundleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError('Failed to log in' + error.message);
    }
    setLoading(false);
  }


  return (

  )
}

export default login
