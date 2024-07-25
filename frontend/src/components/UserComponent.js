import React, { useState } from 'react';
import { Card, Form, Button, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { useUser } from '../contexts/UserContext'; 
import '../styles/User.css';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';

const UserComponent = () => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (e.target.value.trim() !== '') {
      setShowPassword(true);
    } else {
      setShowPassword(false);
      setPassword('');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleAuth = async () => {
    try {
      const data = await userService.checkUser(username);
  
      if (data.exists) {
        try {
          const userData = await userService.login(username, password);
          setUser(userData);
          navigate('/');
        } catch (error) {
          setNotificationMessage(t("wrong_password"));
          setShowNotification(true);
        }
      } else {
        try {
          const userData = await userService.register(username, password);
          setUser(userData);
          navigate('/');
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleGuestSession = async () => {
    try {
      const userData = await userService.guestSession();
      setUser({...userData.user, token: userData.token, isGuest: true});
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="user-container">
      <h1 className="welcome-header">
        {t("welcome")} <span className="logo-container"><img src={require("../assets/logo-h1.png")} alt="SANDOOG" className="sandoog-logo"/></span>
      </h1>
      <Card className="mb-3 user-card">
        <Card.Body>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder={t("username")}
              value={username}
              onChange={handleUsernameChange}
              className="mb-2"
            />
          </Form.Group>
          {showPassword && (
            <Form.Group className="mt-2 password-input">
              <div className={`password-wrapper ${i18n.language === 'ar' ? 'rtl' : ''}`}>
                <Form.Control
                  type={passwordVisible ? "text" : "password"}
                  placeholder={t("password")}
                  value={password}
                  onChange={handlePasswordChange}
                  className="mb-2"
                />
                <FontAwesomeIcon
                  icon={passwordVisible ? faEyeSlash : faEye}
                  onClick={togglePasswordVisibility}
                  className="password-icon"
                />
              </div>
            </Form.Group>
          )}
          {showPassword && (
            <div className="button-container">
              <Button onClick={handleAuth} disabled={!password}>
                {t("signin_register")}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
      <div className="guest-session-container">
        {t("guest_prompt")}
        <Button variant="link" onClick={handleGuestSession}>{t("guest_session")}</Button>
      </div>
      <Toast
        show={showNotification}
        onClose={() => setShowNotification(false)}
        delay={3000}
        autohide
        className="notification-toast"
      >
        <Toast.Header>
          <strong className="mr-auto">{t("oops")}</strong>
        </Toast.Header>
        <Toast.Body>{notificationMessage}</Toast.Body>
      </Toast>
    </div>
  );
};

export default UserComponent;