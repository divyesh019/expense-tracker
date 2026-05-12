import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { apiRequest } from '../api/client.js'

const initialTx = {
  amount: '',
  description: '',
  transactionDate: '',
  categoryId: '',
}

function DashboardPage() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [categories, setCategories] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' })
  const [incomeForm, setIncomeForm] = useState(initialTx)
  const [expenseForm, setExpenseForm] = useState(initialTx)

  const categoryOptions = useMemo(
    () => [{ id: '', name: 'No category' }, ...categories],
    [categories],
  )

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [cats, dash, inc, exp] = await Promise.all([
        apiRequest('/categories', { token }),
        apiRequest('/dashboard', { token }),
        apiRequest('/incomes', { token }),
        apiRequest('/expenses', { token }),
      ])
      setCategories(cats || [])
      setDashboard(dash)
      setIncomes(inc || [])
      setExpenses(exp || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const createCategory = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await apiRequest('/categories', {
        method: 'POST',
        token,
        body: categoryForm,
      })
      setCategoryForm({ name: '', description: '' })
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const createTransaction = async (event, type) => {
    event.preventDefault()
    setError('')
    const form = type === 'INCOME' ? incomeForm : expenseForm
    const endpoint = type === 'INCOME' ? '/incomes' : '/expenses'
    try {
      await apiRequest(endpoint, {
        method: 'POST',
        token,
        body: {
          amount: Number(form.amount),
          description: form.description,
          transactionDate: form.transactionDate,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
        },
      })
      if (type === 'INCOME') {
        setIncomeForm(initialTx)
      } else {
        setExpenseForm(initialTx)
      }
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Layout title="Expense Tracker Dashboard">
      {error && <p className="error banner">{error}</p>}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <div className="grid">
          <section className="card">
            <h2>Summary</h2>
            <div className="stats-grid">
              <Stat label="Total Income" value={dashboard?.totalIncome} />
              <Stat label="Total Expense" value={dashboard?.totalExpense} />
              <Stat label="Balance" value={dashboard?.balance} />
              <Stat label="Income Count" value={dashboard?.incomeTransactionCount} />
              <Stat label="Expense Count" value={dashboard?.expenseTransactionCount} />
            </div>
            <h3>Expenses by Category</h3>
            <ul className="list">
              {(dashboard?.expensesByCategory || []).map((item) => (
                <li key={item.categoryName}>
                  {item.categoryName}: {item.totalAmount}
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>Categories</h2>
            <form className="inline-form" onSubmit={createCategory}>
              <input
                placeholder="Name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <input
                placeholder="Description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
              />
              <button type="submit">Add</button>
            </form>
            <ul className="list">
              {categories.map((cat) => (
                <li key={cat.id}>
                  {cat.name} {cat.description ? `- ${cat.description}` : ''}
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>Add Income</h2>
            <TransactionForm
              form={incomeForm}
              setForm={setIncomeForm}
              categories={categoryOptions}
              onSubmit={(event) => createTransaction(event, 'INCOME')}
            />
            <h3>Income Transactions</h3>
            <TransactionList items={incomes} />
          </section>

          <section className="card">
            <h2>Add Expense</h2>
            <TransactionForm
              form={expenseForm}
              setForm={setExpenseForm}
              categories={categoryOptions}
              onSubmit={(event) => createTransaction(event, 'EXPENSE')}
            />
            <h3>Expense Transactions</h3>
            <TransactionList items={expenses} />
          </section>
        </div>
      )}
    </Layout>
  )
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
  )
}

function TransactionForm({ form, setForm, categories, onSubmit }) {
  return (
    <form className="inline-form" onSubmit={onSubmit}>
      <input
        type="number"
        min="0.01"
        step="0.01"
        placeholder="Amount"
        value={form.amount}
        onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
        required
      />
      <input
        type="date"
        value={form.transactionDate}
        onChange={(e) => setForm((p) => ({ ...p, transactionDate: e.target.value }))}
        required
      />
      <input
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
      />
      <select
        value={form.categoryId}
        onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
      >
        {categories.map((cat) => (
          <option key={cat.id || 'none'} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <button type="submit">Save</button>
    </form>
  )
}

function TransactionList({ items }) {
  return (
    <ul className="list">
      {items.map((tx) => (
        <li key={tx.id}>
          {tx.transactionDate} | {tx.amount} | {tx.description || 'No description'} |{' '}
          {tx.categoryName || 'No category'}
        </li>
      ))}
    </ul>
  )
}

export default DashboardPage
