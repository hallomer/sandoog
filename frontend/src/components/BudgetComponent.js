import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Budget.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card, Form, Table, ProgressBar, Toast } from 'react-bootstrap';
import { FaTrash, FaEdit } from 'react-icons/fa';
import budgetService from '../services/budgetService';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';

const BudgetComponent = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [budgets, setBudgets] = useState([]);
  const [newBudget, setNewBudget] = useState({ name: '', amount: '' });
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: '' });
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [editBudget, setEditBudget] = useState({ name: '', amount: '' });
  const [budgetColors, setBudgetColors] = useState({});

  const getRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  };

  const darkenColor = (color, amount) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
  };

  const translateDefaultBudgets = (budgets) => {
    return budgets.map(budget => ({
      ...budget,
      name: t(budget.name)
    }));
  };

  const fetchBudgets = useCallback(async () => {
    try {
      const fetchedBudgets = await budgetService.getAllBudgets(user.token);
      const translatedDefaultBudgets = translateDefaultBudgets(fetchedBudgets);
      setBudgets(translatedDefaultBudgets);
      const generatedColors = {};
      translatedDefaultBudgets.forEach(budget => {
        generatedColors[budget.id] = getRandomColor();
      });
      setBudgetColors(generatedColors);
    } catch (error) {
      console.error(error);
    }
  }, [user.token, t]);


  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setNewBudget((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  };

  const addBudget = async () => {
    if (parseFloat(newBudget.amount) <= 0) {
      setNotificationMessage(t('wrong_amount'));
      setShowNotification(true);
      return;
    }

    const budget = { ...newBudget, amount: parseFloat(newBudget.amount), spent: 0 };
    try {
      const createdBudget = await budgetService.createBudget(budget, user.token);
      setBudgets((prev) => [...prev, createdBudget]);
      setNewBudget({ name: '', amount: '' });
      setBudgetColors((prev) => ({ ...prev, [createdBudget.id]: getRandomColor() }));
    } catch (error) {
      console.error(error);
    }
  };

  const addExpense = async () => {
    if (parseFloat(newExpense.amount) <= 0) {
      setNotificationMessage(t('wrong_amount'));
      setShowNotification(true);
      return;
    }

    const expense = { ...newExpense, amount: parseFloat(newExpense.amount) };

    const budget = budgets.find((b) => b.name === newExpense.category);
    if (budget && budget.spent + expense.amount > budget.amount) {
      setNotificationMessage(t('exceed_budget'));
      setShowNotification(true);
      return;
    }

    try {
      const updatedBudget = { ...budget, spent: budget.spent + expense.amount, expenses: [...budget.expenses, expense] };
      await budgetService.updateBudget(budget.id, updatedBudget, user.token);

      const updatedBudgets = budgets.map((b) =>
        b.id === budget.id ? updatedBudget : b
      );

      setBudgets(updatedBudgets);
      setNewExpense({ name: '', amount: '', category: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteBudget = async (budgetId) => {
    try {
      await budgetService.deleteBudget(budgetId, user.token);
      setBudgets(budgets.filter((budget) => budget.id !== budgetId));
      setBudgetColors((prev) => {
        const newColors = { ...prev };
        delete newColors[budgetId];
        return newColors;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteExpense = async (budgetId, expenseAmount, expenseIndex) => {
    try {
      const budget = budgets.find((b) => b.id === budgetId);
      const updatedBudget = {
        ...budget,
        spent: budget.spent - expenseAmount,
        expenses: budget.expenses.filter((_, index) => index !== expenseIndex),
      };
      await budgetService.updateBudget(budgetId, updatedBudget, user.token);

      const updatedBudgets = budgets.map((b) =>
        b.id === budgetId ? updatedBudget : b
      );

      setBudgets(updatedBudgets);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleDetails = (budgetId) => {
    if (selectedBudget === budgetId) {
      setSelectedBudget(null);
    } else {
      setSelectedBudget(budgetId);
    }
  };

  const toggleEditBudget = (index) => {
    if (isEditing === index) {
      setIsEditing(null);
    } else {
      setIsEditing(index);
      setEditBudget(budgets[index]);
    }
  };

  const handleEditBudgetChange = (e) => {
    const { name, value } = e.target;
    setEditBudget((prev) => ({ ...prev, [name]: value }));
  };

  const saveEditBudget = async () => {
    if (editBudget.name.trim() === '' || isNaN(editBudget.amount) || editBudget.amount <= 0) {
      setNotificationMessage(t('valid_name_amount'));
      setShowNotification(true);
      return;
    }

    try {
      const updatedBudget = { ...editBudget, amount: parseFloat(editBudget.amount) };
      await budgetService.updateBudget(updatedBudget.id, updatedBudget, user.token);

      const updatedBudgets = budgets.map((budget) =>
        budget.id === updatedBudget.id ? updatedBudget : budget
      );

      setBudgets(updatedBudgets);
      setIsEditing(null);
      setEditBudget({ name: '', amount: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const calculatePercentage = (spent, amount) => {
    const percentage = (spent / amount) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  return (
    <div className="budget-container container">
      <h2>{t('budgets')}</h2>
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
      <div className="budget-grid">
        <Card className="mb-3">
          <Card.Body>
            <h3>{t('create_new_budget')}</h3>
            <Form.Group>
              <Form.Control
                type="text"
                name="name"
                placeholder={t('e.g., Groceries')}
                value={newBudget.name}
                onChange={handleBudgetChange}
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Control
                type="number"
                name="amount"
                placeholder={t('e.g., 500')}
                value={newBudget.amount}
                onChange={handleBudgetChange}
              />
            </Form.Group>
            <div className="button-container">
              <Button
                className="mt-2 btn-custom-width"
                onClick={addBudget}
                disabled={!newBudget.name || !newBudget.amount}
              >
                {t('create_budget')}
              </Button>
            </div>
          </Card.Body>
        </Card>
        <Card className="mb-3">
          <Card.Body>
            <h3>{t('add_new_expense')}</h3>
            <Form.Group>
              <Form.Control
                type="text"
                name="name"
                placeholder={t('e.g., Coffee')}
                value={newExpense.name}
                onChange={handleExpenseChange}
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Control
                type="number"
                name="amount"
                placeholder={t('e.g., 20')}
                value={newExpense.amount}
                onChange={handleExpenseChange}
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Control
                as="select"
                name="category"
                value={newExpense.category}
                onChange={handleExpenseChange}
              >
                <option value="">{t('select_budget')}</option>
                {budgets.map((budget) => (
                  <option key={budget.id} value={budget.name}>
                    {budget.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <div className="button-container">
              <Button
                className="mt-2 btn-custom-width"
                onClick={addExpense}
                disabled={!newExpense.name || !newExpense.amount || !newExpense.category}
              >
                {t('add_expense')}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
      <div className="mt-4">
        <h3 className={`existing-budgets ${budgets.length === 0 ? 'd-none' : ''}`}>{t('existing_budgets')}</h3>
        <div className="budget-grid">
          {budgets.map((budget, index) => {
            const color = budgetColors[budget.id] || '#ffffff';
            return (
              <Card key={budget.id} className="mb-3" style={{ borderColor: color }}>
                <Card.Body style={{ backgroundColor: `${color}22` }}>
                  {isEditing === index ? (
                    <div>
                      <Form.Control
                        type="text"
                        name="name"
                        value={editBudget.name}
                        onChange={handleEditBudgetChange}
                      />
                      <Form.Control
                        type="number"
                        name="amount"
                        value={editBudget.amount}
                        onChange={handleEditBudgetChange}
                        className="mt-2"
                      />
                      <div className="edit-budget-buttons">
                        <Button variant="success" onClick={saveEditBudget}>
                          {t('save')}
                        </Button>
                        <Button variant="secondary" onClick={() => setIsEditing(null)}>
                          {t('cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Card.Title className="d-flex justify-content-between" style={{ color }}>
                        <span>{budget.name}</span>
                        <span>${budget.amount.toFixed(2)}</span>
                      </Card.Title>
                      <ProgressBar
                        now={calculatePercentage(budget.spent, budget.amount)}
                        label={`${calculatePercentage(budget.spent, budget.amount).toFixed(2)}%`}
                        style={{ backgroundColor: `${color}22` }}
                        children={
                          <div
                            className="progress-bar"
                            style={{
                              backgroundColor: darkenColor(color, 20),
                              width: `${calculatePercentage(budget.spent, budget.amount)}%`,
                              color: '#fff',
                              textAlign: 'center',
                            }}
                          >
                            {`${calculatePercentage(budget.spent, budget.amount).toFixed(2)}%`}
                          </div>
                        }
                      />
                      <div className="d-flex justify-content-between small mt-2">
                        <span>{t('spent')}: <span dir="ltr">${budget.spent.toFixed(2)}</span></span>
                        <span>{t('remaining')}: <span dir="ltr">${(budget.amount - budget.spent).toFixed(2)}</span></span>
                      </div>
                      <div className="d-flex justify-content-center mt-3">
                        <Button
                          variant="primary"
                          className="me-2"
                          onClick={() => toggleDetails(budget.id)}
                        >
                          {selectedBudget === budget.id ? t('hide_details') : t('view_details')}
                        </Button>
                        <Button
                          variant="danger"
                          className="me-2 .space_when_ar"
                          onClick={() => deleteBudget(budget.id)}
                        >
                          <FaTrash />
                        </Button>
                        <Button
                          variant="warning"
                          className="me-2 .space_when_ar"
                          onClick={() => toggleEditBudget(index)}
                        >
                          <FaEdit />
                        </Button>
                      </div>
                    </>
                  )}
                  {selectedBudget === budget.id && (
                    <Table striped bordered hover className="mt-3">
                      <tbody>
                        {budget.expenses.map((expense, expenseIndex) => (
                          <tr key={expenseIndex}>
                            <td>{expenseIndex + 1}</td>
                            <td>{expense.name}</td>
                            <td><span dir="ltr">${expense.amount.toFixed(2)}</span></td>
                            <td>
                              <Button
                                variant="danger"
                                onClick={() => deleteExpense(budget.id, expense.amount, expenseIndex)}
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

export default BudgetComponent;