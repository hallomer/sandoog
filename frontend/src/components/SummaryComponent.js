import React, { useState, useEffect, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Link } from 'react-router-dom';
import '../styles/Summary.css';
import summaryService from '../services/summaryService';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const SummaryComponent = () => {
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const [timeFrame, setTimeFrame] = useState('month');
  const [summary, setSummary] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [direction, setDirection] = useState(i18n.dir());

  const budgetColors = ['#008080', '#20B2AA', '#40E0D0', '#48D1CC', '#AFEEEE'];
  const savingColors = ['#FF6B35', '#FF8243', '#FFA07A', '#FF8C00', '#FF4500'];

  const assignColors = (items, colors) => {
    return items.map((item, index) => ({
      ...item,
      color: colors[index % colors.length]
    }));
  };

  const translateDefaultSavings = (savings) => {
    return savings.map(saving => ({
      ...saving,
      name: t(saving.name)
    }));
  };

  const translateDefaultBudgets = (budgets) => {
    return budgets.map(budget => ({
      ...budget,
      name: t(budget.name)
    }));
  };

  const greetings = [
    'hello_wealthy_friend',
    'greetings_prosperous',
    'welcome_successful',
    'hello_financially_savvy',
    'greetings_future_millionaire',
    'hello_money_master',
    'greetings_smart_saver',
    'welcome_budget_boss',
    'hello_financial_guru',
    'greetings_investment_icon'
  ];

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    setGreeting(greetings[randomIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateGraphData = (timeFrame, transactions) => {
    const now = new Date();
    const startDate = getStartDate(now, timeFrame);
    const endDate = new Date(now.getTime());
  
    const labels = generateLabels(timeFrame, transactions.length);
    const daysInPeriod = getDaysInPeriod(timeFrame, startDate, endDate);
  
    const incomeData = new Array(daysInPeriod).fill(0);
    const expenseData = new Array(daysInPeriod).fill(0);
  
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const dayIndex = getDayIndex(timeFrame, startDate, transactionDate);
      if (dayIndex !== -1) {
        if (transaction.type === 'income') {
          incomeData[dayIndex] += transaction.amount;
        } else {
          expenseData[dayIndex] += transaction.amount;
        }
      }
    });
  
    return {
      labels,
      incomeData,
      expenseData,
    };
  };
  
  const getStartDate = (now, timeFrame) => {
    switch (timeFrame) {
      case 'week':
        const firstDayOfWeek = now.getDate() - now.getDay();
        return new Date(now.setDate(firstDayOfWeek));
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return now;
    }
  };
  
  const getDaysInPeriod = (timeFrame, startDate, endDate) => {
    switch (timeFrame) {
      case 'week':
        return 7;
      case 'month':
        return new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
      case 'year':
        return isLeapYear(endDate.getFullYear()) ? 366 : 365;
      default:
        return 1;
    }
  };
  
  const getDayIndex = (timeFrame, startDate, transactionDate) => {
    const daysDifference = Math.floor((transactionDate - startDate) / (1000 * 60 * 60 * 24));
    switch (timeFrame) {
      case 'week':
        return transactionDate.getDay();
      case 'month':
        return Math.floor(daysDifference / 7);
      case 'year':
        return transactionDate.getMonth();
      default:
        return -1;
    }
  };
  
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryData = await summaryService.getSummary(user.token);
        const translatedDefaultBudgets = translateDefaultBudgets(summaryData.budgets);
        const translatedDefaultSavings = translateDefaultSavings(summaryData.savings);
        const translatedSummaryData = {
          ...summaryData,
          budgets: assignColors(translatedDefaultBudgets, budgetColors),
          savings: assignColors(translatedDefaultSavings, savingColors)
        };
        setSummary(translatedSummaryData);
  
        const transactions = [...summaryData.incomeTransactions, ...summaryData.expenseTransactions];
        const graphData = generateGraphData(timeFrame, transactions);
        setGraphData(graphData);
  
        const pieData = {
          total_income: summaryData.total_income,
          total_expenses: summaryData.total_expenses,
        };
        setPieData(pieData);
      } catch (error) {
        console.error(error);
      }
    };
  
    if (user && user.token) {
      fetchData();
    }
  }, [user, timeFrame, t]);

  useEffect(() => {
    setDirection(i18n.dir());
  }, [i18n.dir()]);

  const generateLabels = (timeFrame, dataLength) => {
    switch (timeFrame) {
      case 'week':
        return [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')];
      case 'month':
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysInMonth = endDate.getDate();
        const weeksInMonth = Math.ceil(daysInMonth / 7);
        return Array.from({ length: weeksInMonth }, (_, i) => `${t('month_weeks')} ${i + 1}`);
      case 'year':
        return [
          t('jan'), t('feb'), t('mar'), t('apr'), t('may'), t('jun'),
          t('jul'), t('aug'), t('sep'), t('oct'), t('nov'), t('dec')
        ];
      default:
        return [];
    }
  };

  const lineChartData = useMemo(() => {
    if (!graphData) return null;
    return {
      labels: graphData.labels,
      datasets: [
        {
          label: t('income'),
          data: graphData.incomeData,
          borderColor: budgetColors[0],
          tension: 0.1,
        },
        {
          label: t('expenses'),
          data: graphData.expenseData,
          borderColor: savingColors[0],
          tension: 0.1,
        },
      ],
    };
  }, [graphData, budgetColors, savingColors]);

  const pieChartData = useMemo(() => {
    if (!graphData) return null;
    const totalIncome = graphData.incomeData.reduce((sum, value) => sum + value, 0);
    const totalExpenses = graphData.expenseData.reduce((sum, value) => sum + value, 0);
    return {
      labels: [t('income'), t('expenses')],
      datasets: [
        {
          data: [totalIncome, totalExpenses],
          backgroundColor: [budgetColors[0], savingColors[0]],
        },
      ],
    };
  }, [graphData, budgetColors, savingColors]);


  const lineChartOptions = useMemo(() => ({
    scales: {
      x: {
        reverse: direction === 'rtl',
        ticks: {
          font: {
            size: direction === 'rtl' ? 11.5 : 12
          }
        }
      },
      y: {
        min: 0,
        position: direction === 'rtl' ? 'right' : 'left',
        ticks: {
          font: {
            size: direction === 'rtl' ? 11.5 : 12
          }
        }
      },
    },
    layout: {
      padding: direction === 'rtl' ? { left: 30 } : {}
    }
  }), [direction]);

  const handleTimeFrameChange = () => {
    const frames = ['month', 'year', 'week'];
    const currentIndex = frames.indexOf(timeFrame);
    const nextIndex = (currentIndex + 1) % frames.length;
    setTimeFrame(frames[nextIndex]);
  };

  if (!summary || !graphData || !pieData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="summary-container">
      <h2 className="greeting">{t(greeting)}</h2>
      <div className="main-content">
        <div className="charts-section">
          <Card className="chart-card">
            <Card.Body>
              <div className="time-frame-wrapper">
                <button className="time-frame-button" onClick={handleTimeFrameChange}>
                  {t('this')} {t(timeFrame)}
                </button>
              </div>
              <div className="charts-wrapper">
                <div className="linear-chart">
                  {lineChartData && <Line data={lineChartData} options={lineChartOptions} />}
                </div>
                <div className="pie-chart">
                  <div className="pie-chart-container">
                    {pieChartData && <Pie data={pieChartData} />}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="totals-section">
          <Card className="totals-card">
            <Card.Body>
              <h3>{t('total_balance')}</h3>
              <div className="total-amount"><span dir="ltr">${summary.total_balance.toFixed(2)}</span></div>
              <div className="total-item">
                <h3>{t('total_income')}</h3>
                <div className="amount-wrapper">
                  <span style={{ color: budgetColors[0] }}><span dir="ltr">${summary.total_income.toFixed(2)}</span></span>
                  <Link to="/transactions" className="btn btn-primary">{t('add')}</Link>
                </div>
              </div>
              <div className="total-item">
                <h3>{t('total_expenses')}</h3>
                <div className="amount-wrapper">
                  <span style={{ color: savingColors[0] }}><span dir="ltr">${summary.total_expenses.toFixed(2)}</span></span>
                  <Link to="/transactions" className="btn btn-primary">{t('add')}</Link>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
      <div className="bottom-section">
        <Card className="budgets-card">
          <Card.Body>
            <h3>{t('budgets')}</h3>
            {summary.budgets.map((budget, index) => (
              <div key={index} className="budget-item" style={{ color: budget.color, borderColor: budget.color, backgroundColor: `${budget.color}22`}}>
                <span>{budget.name}</span>
                <div className="budget-amounts">
                  <span><span dir="ltr">${budget.spent.toFixed(2)}</span> / <span dir="ltr">${budget.amount.toFixed(2)}</span></span>
                </div>
              </div>
            ))}
            <Link to="/budgets" className="btn btn-primary mt-3">{t('add')}</Link>
          </Card.Body>
        </Card>
        <Card className="savings-card">
          <Card.Body>
            <h3>{t('savings')}</h3>
            {summary.savings.map((savings, index) => (
              <div key={index} className="savings-item" style={{ color: savings.color, borderColor: savings.color, backgroundColor: `${savings.color}22`}}>
                <span>{savings.name}</span>
                <div className="savings-amounts">
                  <span><span dir="ltr">${savings.saved.toFixed(2)}</span> / <span dir="ltr">${savings.goal.toFixed(2)}</span></span>
                </div>
              </div>
            ))}
            <Link to="/savings" className="btn btn-primary mt-3">{t('add')}</Link>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default SummaryComponent;