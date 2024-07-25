import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Savings.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card, Form, Table, ProgressBar, Toast } from 'react-bootstrap';
import { FaTrash, FaEdit } from 'react-icons/fa';
import savingsService from '../services/savingsService';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';


const SavingsComponent = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [savings, setSavings] = useState([]);
  const [newSaving, setNewSaving] = useState({ name: '', goal: '' });
  const [newContribution, setNewContribution] = useState({ name: '', amount: '', category: '' });
  const [selectedSaving, setSelectedSaving] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [editSaving, setEditSaving] = useState({ name: '', goal: '' });
  const [savingColors, setSavingColors] = useState({});
  
  const getRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  };

  const darkenColor = (color, amount) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
  };

  const translateDefaultSavings = (savings) => {
    return savings.map(saving => ({
      ...saving,
      name: t(saving.name)
    }));
  };

  const fetchsavings = useCallback(async () => {
    try {
      const fetchedSavings = await savingsService.getAllSavings(user.token);
      const translatedDefaultSavings = translateDefaultSavings(fetchedSavings);
      setSavings(translatedDefaultSavings);
      const generatedColors = {};
      translatedDefaultSavings.forEach(saving => {
        generatedColors[saving.id] = getRandomColor();
      });
      setSavingColors(generatedColors);
    } catch (error) {
      console.error(error);
    }
  }, [user.token, t]);

  useEffect(() => {
    fetchsavings();
  }, [fetchsavings]);


  const handleSavingChange = (e) => {
    const { name, value } = e.target;
    setNewSaving((prev) => ({ ...prev, [name]: value }));
  };

  const handleContributionChange = (e) => {
    const { name, value } = e.target;
    setNewContribution((prev) => ({ ...prev, [name]: value }));
  };

  const addSaving = async () => {
    if (parseFloat(newSaving.goal) <= 0) {
      setNotificationMessage(t('wrong_amount'));
      setShowNotification(true);
      return;
    }
    
    const saving = { ...newSaving, goal: parseFloat(newSaving.goal), saved: 0};
    try {
      const createdSaving = await savingsService.createSaving(saving, user.token);
      setSavings((prev) => [...prev, createdSaving]);
      setNewSaving({ name: '', goal: '' });
      setSavingColors((prev) => ({ ...prev, [createdSaving.id]: getRandomColor() }));
    } catch (error) {
      console.error(error);
    }
  };

  const addContribution = async () => {
    if (parseFloat(newContribution.amount) <= 0) {
      setNotificationMessage(t('wrong_amount'));
      setShowNotification(true);
      return;
    }

    const contribution = { ...newContribution, amount: parseFloat(newContribution.amount) };

    const saving = savings.find((s) => s.name === newContribution.category);
    if (saving && saving.saved + contribution.amount > saving.goal) {
      setNotificationMessage(t("exceed_saving"));
      setShowNotification(true);
      return;
    }

    try {
      const updatedSaving = { ...saving, saved: saving.saved + contribution.amount, contributions: [...saving.contributions, contribution] };
      await savingsService.updateSaving(saving.id, updatedSaving, user.token);

      const updatedSavings = savings.map((s) =>
        s.id === saving.id ? updatedSaving : s
      );

      setSavings(updatedSavings);
      setNewContribution({ name: '', amount: '', category: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteSaving = async (savingId) => {
    try {
      await savingsService.deleteSaving(savingId, user.token);
      setSavings(savings.filter((saving) => saving.id !== savingId));
      setSavingColors((prev) => {
        const newColors = { ...prev };
        delete newColors[savingId];
        return newColors;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteContribution = async (savingId, expenseAmount, expenseIndex) => {
    try {
      const saving = savings.find((s) => s.id === savingId);
      const updatedSaving = {
        ...saving,
        saved: saving.saved - expenseAmount,
        contributions: saving.contributions.filter((_, index) => index !== expenseIndex),
      };
      await savingsService.updateSaving(savingId, updatedSaving, user.token);

      const updatedSavings = savings.map((s) =>
        s.id === savingId ? updatedSaving : s
      );

      setSavings(updatedSavings);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleDetails = (savingId) => {
    if (selectedSaving === savingId) {
      setSelectedSaving(null);
    } else {
      setSelectedSaving(savingId);
    }
  };

  const toggleEditSaving = (index) => {
    if (isEditing === index) {
      setIsEditing(null);
    } else {
      setIsEditing(index);
      setEditSaving(savings[index]);
    }
  };

  const handleEditSavingChange = (e) => {
    const { name, value } = e.target;
    setEditSaving((prev) => ({ ...prev, [name]: value }));
  };

  const saveEditSaving = async () => {
    if (editSaving.name.trim() === '' || isNaN(editSaving.goal) || editSaving.goal <= 0) {
      setNotificationMessage(t('valid_name_amount'));
      setShowNotification(true);
      return;
    }
    try {
      const updatedSaving = { ...editSaving, goal: parseFloat(editSaving.goal) };
      await savingsService.updateSaving(updatedSaving.id, updatedSaving, user.token);

      const updatedSavings = savings.map((saving) =>
        saving.id === updatedSaving.id ? updatedSaving : saving
      );

      setSavings(updatedSavings);
      setIsEditing(null);
      setEditSaving({ name: '', goal: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const calculatePercentage = (saved, goal) => {
    const percentage = (saved / goal) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  return (
    <div className="savings-container container">
      <h2>{t('savings')}</h2>
      <Toast
        show={showNotification}
        onClose={() => setShowNotification(false)}
        delay={3000}
        autohide
        className="notification-toast"
      >
        <Toast.Header>
          <strong className="mr-auto">{t('oops')}</strong>
        </Toast.Header>
        <Toast.Body>{notificationMessage}</Toast.Body>
      </Toast>
      <div className="savings-grid">
        <Card className="mb-3">
          <Card.Body>
          <h3>{t('create_new_saving')}</h3>
            <Form.Group>
              <Form.Control
                type="text"
                name="name"
                placeholder={t('e.g., New Car')}
                value={newSaving.name}
                onChange={handleSavingChange}
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Control
                type="number"
                name="goal"
                placeholder={t('e.g., 3000')}
                value={newSaving.goal}
                onChange={handleSavingChange}
              />
            </Form.Group>
            <div className="button-container">
              <Button
                className="mt-2 btn-custom-width"
                onClick={addSaving}
                disabled={!newSaving.name || !newSaving.goal}
              >
                {t('create_saving')}
              </Button>
            </div>
          </Card.Body>
        </Card>
        <Card className="mb-3">
          <Card.Body>
          <h3>{t('add_new_contribution')}</h3>
            <Form.Group>
              <Form.Control
                type="text"
                name="name"
                placeholder={t('e.g., Bonus')}
                value={newContribution.name}
                onChange={handleContributionChange}
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Control
                type="number"
                name="amount"
                placeholder={t('e.g., 500')}
                value={newContribution.amount}
                onChange={handleContributionChange}
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Control
                as="select"
                name="category"
                value={newContribution.category}
                onChange={handleContributionChange}
              >
                <option value="">{t('select_saving')}</option>
                {savings.map((saving) => (
                  <option key={saving.id} value={saving.name}>
                    {saving.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <div className="button-container">
              <Button
                className="mt-2 btn-custom-width"
                onClick={addContribution}
                disabled={!newContribution.name || !newContribution.amount || !newContribution.category}
              >
                {t('add_contribution')}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
      <div className="mt-4">
        <h3 className={`existing-savings ${savings.length === 0 ? 'd-none' : ''}`}>{t('existing_savings')}</h3>
        <div className="savings-grid">
          {savings.map((saving, index) => {
            const color = savingColors[saving.id] || '#ffffff';
            return (
              <Card key={index} className="mb-3" style={{ borderColor: color }}>
                <Card.Body style={{ backgroundColor: `${color}22` }}>
                  {isEditing === index ? (
                    <div>
                      <Form.Control
                        type="text"
                        name="name"
                        value={editSaving.name}
                        onChange={handleEditSavingChange}
                      />
                      <Form.Control
                        type="number"
                        name="goal"
                        value={editSaving.goal}
                        onChange={handleEditSavingChange}
                        className="mt-2"
                      />
                      <div className="edit-savings-buttons">
                        <Button variant="success" onClick={saveEditSaving}>
                        {t('save')}
                        </Button>
                        <Button variant="secondary" onClick={() => setIsEditing(null)}>
                        {t('cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Card.Title className="d-flex justify-content-between" style={{ color: color }}>
                        <span>{saving.name}</span>
                        <span>${saving.goal.toFixed(2)}</span>
                      </Card.Title>
                      <ProgressBar
                        now={calculatePercentage(saving.saved, saving.goal)}
                        label={`${calculatePercentage(saving.saved, saving.goal).toFixed(2)}%`}
                        style={{ backgroundColor: `${color}22` }}
                        children={
                          <div
                            className="progress-bar"
                            style={{
                              backgroundColor: darkenColor(color, 20),
                              width: `${calculatePercentage(saving.saved, saving.goal)}%`,
                              color: '#fff',
                              textAlign: 'center',
                            }}
                          >
                            {`${calculatePercentage(saving.saved, saving.goal).toFixed(2)}%`}
                          </div>
                        }
                      />
                      <div className="d-flex justify-content-between small mt-2">
                      <span>{t('saved')}: <span dir="ltr">${saving.saved.toFixed(2)}</span></span>
                      <span>{t('remaining')}: <span dir="ltr">${(saving.goal - saving.saved).toFixed(2)}</span></span>
                      </div>
                      <div className="d-flex justify-content-center mt-3">
                        <Button
                          variant="primary"
                          className="me-2"
                          onClick={() => toggleDetails(saving.id)}
                        >
                          {selectedSaving === saving.id ? t('hide_details') : t('view_details')}
                        </Button>
                        <Button
                          variant="danger"
                          className="me-2 space_when_ar"
                          onClick={() => deleteSaving(saving.id)}
                        >
                          <FaTrash />
                        </Button>
                        <Button
                          variant="warning"
                          className="me-2 space_when_ar"
                          onClick={() => toggleEditSaving(index)}
                        >
                          <FaEdit />
                        </Button>
                      </div>
                    </>
                  )}
                  {selectedSaving === saving.id && (
                    <Table striped bordered hover className="mt-3">
                      <tbody>
                        {saving.contributions.map((contribution, contributionIndex) => (
                          <tr key={contributionIndex}>
                            <td>{contributionIndex + 1}</td>
                            <td>{contribution.name}</td>
                            <td>${contribution.amount.toFixed(2)}</td>
                            <td>
                              <Button
                                variant="danger"
                                onClick={() => deleteContribution(saving.id, contribution.amount, contributionIndex)}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SavingsComponent;