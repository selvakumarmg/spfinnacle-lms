import React from 'react';
import { auth, db, provider } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import { Button, Input, message, Form } from 'antd';
import { MailOutlined, GoogleOutlined } from '@ant-design/icons';
import '../styles/login.css';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { setAuthStatus, setUserDetails } from '../config/store/reducer/AuthReducer';
import { useDispatch } from 'react-redux';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then((data) => {
        console.log("data", data.user)
        const {
          uid,
          email,
          displayName,
          photoURL,
        } = data.user;
        const userData = { uid, email, displayName, photoURL };
        navigate('/user-details', { state: userData });
      })
      .catch();
  };

  const onFinish = (values) => {
    console.log('Received values:', values);
    const { email, password } = values;
    handleSignUp(email, password);
    // Perform additional actions such as form submission or validation here
  };

  const handleSignUp = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up successfully
        const user = userCredential.user;
        const {
          uid,
          email,
          displayName,
          photoURL,
        } = user;
        const userData = { uid, email, displayName, photoURL };
        console.log("handleSignUp", uid)
        // navigate('/user-details', { state: userData });
      })
      .catch((error) => {
        // Handle sign-up errors

        if (error.message === 'Firebase: Error (auth/email-already-in-use).') {
          handleSignIn(email, password);
        } else {
          message.error(error.message);
        }
      });
  };

  const fetchUserDetails = async (uid,userData) => {
    try {
      console.log('UISD', uid)
      const userCollectionsRef = collection(db, 'users');
        const userCollectionsSnapshot = await getDocs(userCollectionsRef);
        console.log("userDocSnap",userCollectionsRef)

       const user = userCollectionsSnapshot.map(async(el) => {
        const userDocRef = doc(collection(db, 'users'), el.id);
        const userDocSnap = await getDoc(userDocRef);
        return userDocSnap;
        });
     
        
        // if(uid === userDocSnap.data().uid){
        //   message.success('LoggedIn Success')
        //   dispatch(setAuthStatus(true));
        //   dispatch(setUserDetails(userDocSnap.data()));
        //   navigate('/spfinnacle-lms')

        // }else{
        //   console.log("Else")
        //   navigate('/user-details', { state: userData });
        // }

    } catch (error) {
      navigate('/user-details', { state: userData })
      // message.error('Error fetching user details:', error);
      console.log("error", error)
    }
  };

  const handleSignIn = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in successfully
        const user = userCredential.user;
        const {
          uid,
          email,
          displayName,
          photoURL,
        } = user;
        console.log("handleSignIn", uid);
        const userData = { uid, email, displayName, photoURL };
        fetchUserDetails(uid,userData)
      })
      .catch((error) => {
        // Handle sign-in errors
        message.error(error.message);
      });
  };

  return (
    <div className="login-container">
      <div className="left-section">
        <h1 className="login-title">Connect with SP Finnacle</h1>
        <span>
          Connect clients and organizations for a trusted loan process. Our platform facilitates seamless communication and collaboration between borrowers and lenders, ensuring transparency and reliability. Build trust and streamline the loan application process, empowering individuals and businesses to achieve their financial goals efficiently.
        </span>
      </div>
      <div className="right-section">
        <h3>Continue with Email</h3>
        <Form onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: 'Please enter your email address!',
              },
              {
                type: 'email',
                message: 'Please enter a valid email address!',
              },
            ]}
          >
            <Input
              placeholder="Enter email address"
              className="email-field"
              prefix={<MailOutlined />}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Please enter your password!',
              },
              {
                min: 4,
                message: 'Password must be at least 6 characters!',
              },
            ]}
          >
            <Input.Password
              placeholder="Enter password"
              className="password-field"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" className="enroll-button">
            Enroll
          </Button>
        </Form>
        <p>or</p>
        <Button
          type="primary"
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}
          className="google-button"
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default Login;