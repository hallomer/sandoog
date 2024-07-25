import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Transaction.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card, Form, Table, Toast } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import transactionService from '../services/transactionService';
import { useTranslation } from 'react-i18next';

const TransactionComponent = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const { user } = useUser();

  const fetchTransactions = useCallback(async () => {
    try {
      const fetchedTransactions = await transactionService.getAllTransactions(user.token);
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error(error);
    }
  }, [user.token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({ ...prev, [name]: value }));
  };

  const [lastAddedType, setLastAddedType] = useState(null);
  const addTransaction = async (type) => {
    if (parseFloat(newTransaction.amount) <= 0) {
      setNotificationMessage(t("wrong_amount"));
      setShowNotification(true);
      return;
    }

    const transaction = { 
      ...newTransaction, 
      amount: parseFloat(newTransaction.amount),
      type
    };

    try {
      const addedTransaction = await transactionService.addTransaction(transaction, user.token);
      setTransactions((prev) => [addedTransaction, ...prev]);
      setNewTransaction({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setLastAddedType(type);
    } catch (error) {
      console.error(error);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const deleteTransaction = async (id) => {
    try {
      await transactionService.deleteTransaction(id, user.token);
      setTransactions(transactions.filter((transaction) => transaction.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const incomes = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');

  return (
    <div className="transaction-container container">
      <h2>{t("income_expenses")}</h2>
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
      <div className="transaction-grid">
        <Card className="mb-3">
          <Card.Body>
          <Form.Group className="mt-2">
              <Form.Control
                type="date"
                name="date"
                value={newTransaction.date}
                onChange={handleTransactionChange}
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Control
                type="text"
                name="description"
                placeholder={t("description")}
                value={newTransaction.description}
                onChange={handleTransactionChange}
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Control
                type="number"
                name="amount"
                placeholder={t("amount")}
                value={newTransaction.amount}
                onChange={handleTransactionChange}
              />
            </Form.Group>
            <div className="button-container">
              <Button
                className="mt-2 btn-custom-width me-2 space_when_ar"
                onClick={() => addTransaction('income')}
                disabled={!newTransaction.amount || !newTransaction.description}
              >
                {t("income_button")}
              </Button>
              <Button
                className="mt-2 btn-custom-width space_when_ar"
                onClick={() => addTransaction('expense')}
                disabled={!newTransaction.amount || !newTransaction.description}
              >
                {t("expense_button")}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
      {lastAddedType === 'income' && incomes.length > 0 && (
        <div className="mt-4">
          <h3>{t("recent_income")}</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>{t("date")}</th>
                <th>{t("description")}</th>
                <th>{t("amount")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
            {incomes.map((income) => (
              <tr key={income.id}>
                <td>{formatDate(income.date)}</td>
                <td>{income.description}</td>
                <td><span dir="ltr">${income.amount.toFixed(2)}</span></td>
                <td>
                  <Button
                    variant="danger"
                    className='table-trash'
                    onClick={() => deleteTransaction(income.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
            </tbody>
          </Table>
        </div>
      )}
      {lastAddedType === 'expense' && expenses.length > 0 && (
        <div className="mt-4">
          <h3>{t("recent_expenses")}</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>{t("date")}</th>
                <th>{t("description")}</th>
                <th>{t("amount")}</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{formatDate(expense.date)}</td>
                <td>{expense.description}</td>
                <td><span dir="ltr">${expense.amount.toFixed(2)}</span></td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => deleteTransaction(expense.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TransactionComponent;