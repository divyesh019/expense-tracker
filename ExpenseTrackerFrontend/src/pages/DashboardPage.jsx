import { useCallback, useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { apiRequest, downloadBlob, triggerBrowserDownload } from '../api/client.js'
import {
  IconCalendar,
  IconChart,
  IconCoins,
  IconFileText,
  IconPencil,
  IconPercent,
  IconTag,
  IconTrash,
  IconUser,
  IconWallet,
} from '../components/icons.jsx'

const initialTx = {
  amount: '',
  description: '',
  transactionDate: '',
  categoryId: '',
}

function formatAmount(value) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)
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
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [incomeForm, setIncomeForm] = useState(initialTx)
  const [expenseForm, setExpenseForm] = useState(initialTx)
  const [editingIncomeId, setEditingIncomeId] = useState(null)
  const [editingExpenseId, setEditingExpenseId] = useState(null)
  const [summaryDownloadBusy, setSummaryDownloadBusy] = useState(false)

  const categoryOptions = useMemo(
    () => [{ id: '', name: 'No category' }, ...categories],
    [categories],
  )

  const expenseByCategory = dashboard?.expensesByCategory || []
  const maxCategoryTotal = Math.max(
    1,
    ...expenseByCategory.map((item) => Number(item.totalAmount) || 0),
  )

  const loadData = useCallback(async () => {
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
  }, [token])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount fetch; setState runs inside async loadData after await
    void loadData()
  }, [loadData])

  const saveCategory = async (event) => {
    event.preventDefault()
    setError('')
    try {
      if (editingCategoryId) {
        await apiRequest(`/categories/${editingCategoryId}`, {
          method: 'PUT',
          token,
          body: categoryForm,
        })
        setEditingCategoryId(null)
      } else {
        await apiRequest('/categories', {
          method: 'POST',
          token,
          body: categoryForm,
        })
      }
      setCategoryForm({ name: '', description: '' })
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const startEditCategory = (cat) => {
    setEditingCategoryId(cat.id)
    setCategoryForm({ name: cat.name || '', description: cat.description || '' })
  }

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null)
    setCategoryForm({ name: '', description: '' })
  }

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return
    setError('')
    try {
      await apiRequest(`/categories/${id}`, { method: 'DELETE', token })
      if (editingCategoryId === id) cancelCategoryEdit()
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const downloadTransactionSummary = async () => {
    setError('')
    setSummaryDownloadBusy(true)
    try {
      const { blob, filename } = await downloadBlob('/excel', {
        token,
        fallbackFilename: 'TransactionSummary.xlsx',
      })
      triggerBrowserDownload(blob, filename)
    } catch (err) {
      setError(err.message)
    } finally {
      setSummaryDownloadBusy(false)
    }
  }

  const saveIncome = async (event) => {
    event.preventDefault()
    setError('')
    const body = {
      amount: Number(incomeForm.amount),
      description: incomeForm.description,
      transactionDate: incomeForm.transactionDate,
      categoryId: incomeForm.categoryId ? Number(incomeForm.categoryId) : null,
    }
    try {
      if (editingIncomeId) {
        await apiRequest(`/incomes/${editingIncomeId}`, { method: 'PUT', token, body })
        setEditingIncomeId(null)
      } else {
        await apiRequest('/incomes', { method: 'POST', token, body })
      }
      setIncomeForm(initialTx)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const saveExpense = async (event) => {
    event.preventDefault()
    setError('')
    const body = {
      amount: Number(expenseForm.amount),
      description: expenseForm.description,
      transactionDate: expenseForm.transactionDate,
      categoryId: expenseForm.categoryId ? Number(expenseForm.categoryId) : null,
    }
    try {
      if (editingExpenseId) {
        await apiRequest(`/expenses/${editingExpenseId}`, { method: 'PUT', token, body })
        setEditingExpenseId(null)
      } else {
        await apiRequest('/expenses', { method: 'POST', token, body })
      }
      setExpenseForm(initialTx)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const startEditIncome = (tx) => {
    setEditingIncomeId(tx.id)
    setIncomeForm({
      amount: String(tx.amount),
      description: tx.description || '',
      transactionDate: tx.transactionDate,
      categoryId: tx.categoryId != null ? String(tx.categoryId) : '',
    })
  }

  const startEditExpense = (tx) => {
    setEditingExpenseId(tx.id)
    setExpenseForm({
      amount: String(tx.amount),
      description: tx.description || '',
      transactionDate: tx.transactionDate,
      categoryId: tx.categoryId != null ? String(tx.categoryId) : '',
    })
  }

  const cancelIncomeEdit = () => {
    setEditingIncomeId(null)
    setIncomeForm(initialTx)
  }

  const cancelExpenseEdit = () => {
    setEditingExpenseId(null)
    setExpenseForm(initialTx)
  }

  const deleteIncome = async (id) => {
    if (!window.confirm('Delete this income entry?')) return
    setError('')
    try {
      await apiRequest(`/incomes/${id}`, { method: 'DELETE', token })
      if (editingIncomeId === id) cancelIncomeEdit()
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteExpense = async (id) => {
    if (!window.confirm('Delete this expense entry?')) return
    setError('')
    try {
      await apiRequest(`/expenses/${id}`, { method: 'DELETE', token })
      if (editingExpenseId === id) cancelExpenseEdit()
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Layout title="Expense Tracker Dashboard">
      {error && <p className="error banner">{error}</p>}
      {loading ? (
        <p className="loading-state muted">Loading your dashboard…</p>
      ) : (
        <div className="dash-grid">
          <section className="dash-card">
            <div className="card-heading">
              <h2>Summary</h2>
              <button
                type="button"
                className="btn-teal"
                disabled={summaryDownloadBusy}
                onClick={downloadTransactionSummary}
              >
                {summaryDownloadBusy ? 'Preparing…' : 'Download Excel summary'}
              </button>
            </div>

            <div className="stat-grid">
              <StatTile
                variant="teal"
                label="Total Income"
                value={formatAmount(dashboard?.totalIncome)}
                icon={<IconWallet />}
              />
              <StatTile
                variant="purple"
                label="Total Expense"
                value={formatAmount(dashboard?.totalExpense)}
                icon={<IconChart />}
              />
              <StatTile
                variant="green"
                label="Balance"
                value={formatAmount(dashboard?.balance)}
                icon={<IconCoins />}
              />
              <StatTile
                variant="teal"
                label="Income Count"
                value={dashboard?.incomeTransactionCount ?? 0}
                icon={<IconUser />}
              />
              <StatTile
                variant="purple"
                label="Expense Count"
                value={dashboard?.expenseTransactionCount ?? 0}
                icon={<IconPercent />}
              />
            </div>

            <p className="section-label">Expenses by Category</p>
            <div className="category-bars">
              {expenseByCategory.length === 0 ? (
                <p className="muted" style={{ margin: 0, fontSize: '0.875rem' }}>
                  No categorized expenses yet.
                </p>
              ) : (
                expenseByCategory.map((item) => {
                  const amt = Number(item.totalAmount) || 0
                  const pct = Math.round((amt / maxCategoryTotal) * 100)
                  return (
                    <div key={item.categoryName} className="category-bar-row">
                      <div className="category-bar-top">
                        <span className="category-bar-name">{item.categoryName}</span>
                        <span className="category-bar-amount">{formatAmount(item.totalAmount)}</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          <section className="dash-card">
            <h2 style={{ marginBottom: '6px' }}>Your Categories</h2>
            <p className="muted section-hint" style={{ marginBottom: '14px' }}>
              Categories are private to your account. Other users cannot see or use them.
            </p>
            <form className="form-row-icons" onSubmit={saveCategory}>
              <div className="input-icon-wrap">
                <span className="input-adorn" aria-hidden>
                  <IconTag />
                </span>
                <input
                  placeholder="Name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="input-icon-wrap">
                <span className="input-adorn" aria-hidden>
                  <IconFileText />
                </span>
                <input
                  placeholder="Description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="form-actions-inline">
                {editingCategoryId != null && (
                  <button type="button" className="btn-ghost" onClick={cancelCategoryEdit}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn-primary">
                  {editingCategoryId != null ? 'Update' : 'Add'}
                </button>
              </div>
            </form>

            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="cell-muted">
                        No categories yet. Add one above to use it on income and expenses.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id}>
                        <td>{cat.name}</td>
                        <td className="cell-muted">{cat.description || '—'}</td>
                        <td className="col-actions">
                          <div className="col-actions-inner">
                            <button
                              type="button"
                              className="btn-icon"
                              title="Edit"
                              aria-label={`Edit ${cat.name}`}
                              onClick={() => startEditCategory(cat)}
                            >
                              <IconPencil width={18} height={18} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon btn-icon--danger"
                              title="Delete"
                              aria-label={`Delete ${cat.name}`}
                              onClick={() => deleteCategory(cat.id)}
                            >
                              <IconTrash width={18} height={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="dash-card">
            <div className="card-heading-row" style={{ marginBottom: '14px' }}>
              <div className="card-heading-titles">
                <h2>Add Income</h2>
                <span className="count-badge count-badge--teal">
                  Income {dashboard?.incomeTransactionCount ?? 0}
                </span>
              </div>
            </div>

            <form className="form-row-icons" onSubmit={saveIncome}>
              <div className="input-icon-wrap">
                <span className="input-adorn" aria-hidden>
                  <IconWallet />
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Amount"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm((p) => ({ ...p, amount: e.target.value }))}
                  required
                />
              </div>
              <div className="input-icon-wrap">
                <span className="input-adorn" aria-hidden>
                  <IconFileText />
                </span>
                <input
                  placeholder="Description"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="input-icon-wrap">
                <span className="input-adorn" aria-hidden>
                  <IconCalendar />
                </span>
                <input
                  type="date"
                  value={incomeForm.transactionDate}
                  onChange={(e) => setIncomeForm((p) => ({ ...p, transactionDate: e.target.value }))}
                  required
                />
              </div>
              <div className="input-icon-wrap">
                <span className="input-adorn" aria-hidden>
                  <IconTag />
                </span>
                <select
                  value={incomeForm.categoryId}
                  onChange={(e) => setIncomeForm((p) => ({ ...p, categoryId: e.target.value }))}
                  title="Your categories only"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.id || 'none'} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions-inline">
                {editingIncomeId != null && (
                  <button type="button" className="btn-ghost" onClick={cancelIncomeEdit}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn-primary">
                  {editingIncomeId != null ? 'Update' : 'Save'}
                </button>
              </div>
            </form>

            <h3 style={{ marginTop: '8px', marginBottom: '8px' }}>Income</h3>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="cell-muted">
                        No income yet.
                      </td>
                    </tr>
                  ) : (
                    incomes.map((tx) => (
                      <tr key={tx.id}>
                        <td className="cell-num">{tx.transactionDate}</td>
                        <td className="cell-num">{formatAmount(tx.amount)}</td>
                        <td>{tx.description || <span className="cell-muted">—</span>}</td>
                        <td className="cell-muted">{tx.categoryName || 'No category'}</td>
                        <td className="col-actions">
                          <div className="col-actions-inner">
                            <button
                              type="button"
                              className="btn-icon"
                              title="Edit"
                              aria-label="Edit income"
                              onClick={() => startEditIncome(tx)}
                            >
                              <IconPencil width={18} height={18} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon btn-icon--danger"
                              title="Delete"
                              aria-label="Delete income"
                              onClick={() => deleteIncome(tx.id)}
                            >
                              <IconTrash width={18} height={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="dash-card">
            <div className="card-heading-row" style={{ marginBottom: '14px' }}>
              <div className="card-heading-titles">
                <h2>Add Expense</h2>
                <span className="count-badge count-badge--purple">
                  Expense {dashboard?.expenseTransactionCount ?? 0}
                </span>
              </div>
            </div>

            <form className="form-row-icons" onSubmit={saveExpense}>
              <div className="input-icon-wrap">
                <span className="input-adorn" aria-hidden>
                  <IconWallet />
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Amount"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, amount: e.target.value }))}
                  required
                />
              </div>
              <div className="input-icon-wrap">
                <span className="input-adorn" aria-hidden>
                  <IconFileText />
                </span>
                <input
                  placeholder="Description"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="input-icon-wrap">
                <span className="input-adorn" aria-hidden>
                  <IconCalendar />
                </span>
                <input
                  type="date"
                  value={expenseForm.transactionDate}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, transactionDate: e.target.value }))}
                  required
                />
              </div>
              <div className="input-icon-wrap">
                <span className="input-adorn" aria-hidden>
                  <IconTag />
                </span>
                <select
                  value={expenseForm.categoryId}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, categoryId: e.target.value }))}
                  title="Your categories only"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.id || 'none'} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions-inline">
                {editingExpenseId != null && (
                  <button type="button" className="btn-ghost" onClick={cancelExpenseEdit}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn-primary">
                  {editingExpenseId != null ? 'Update' : 'Save'}
                </button>
              </div>
            </form>

            <h3 style={{ marginTop: '8px', marginBottom: '8px' }}>Expenses</h3>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="cell-muted">
                        No expenses yet.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((tx) => (
                      <tr key={tx.id}>
                        <td className="cell-num">{tx.transactionDate}</td>
                        <td className="cell-num">{formatAmount(tx.amount)}</td>
                        <td>{tx.description || <span className="cell-muted">—</span>}</td>
                        <td className="cell-muted">{tx.categoryName || 'No category'}</td>
                        <td className="col-actions">
                          <div className="col-actions-inner">
                            <button
                              type="button"
                              className="btn-icon"
                              title="Edit"
                              aria-label="Edit expense"
                              onClick={() => startEditExpense(tx)}
                            >
                              <IconPencil width={18} height={18} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon btn-icon--danger"
                              title="Delete"
                              aria-label="Delete expense"
                              onClick={() => deleteExpense(tx.id)}
                            >
                              <IconTrash width={18} height={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </Layout>
  )
}

function StatTile({ variant, label, value, icon }) {
  return (
    <div className={`stat-tile stat-tile--${variant}`}>
      <div className="stat-tile-icon">{icon}</div>
      <span className="stat-tile-label">{label}</span>
      <strong className="stat-tile-value">{value}</strong>
    </div>
  )
}

export default DashboardPage
