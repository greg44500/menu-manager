// frontend/src/store/slices/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../utils/axios' // ← Import du client configuré

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, thunkAPI) => {
    try {
      console.log('🔄 Fetching dashboard stats with authentication...')
      
      // 🔍 TEST CHAQUE API AVEC LE CLIENT CONFIGURÉ
      console.log('📡 Calling users API...')
      const usersRes = await apiClient.get('/api/users')
        .then(response => {
          console.log('✅ Users API SUCCESS:', response.data)
          return response
        })
        .catch(err => {
          console.error('❌ Users API ERROR:', {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message
          })
          // Retourner une structure par défaut en cas d'erreur
          return { data: { success: false, count: 0, data: [] } }
        })
      
      console.log('📡 Calling classrooms API...')  
      const classroomsRes = await apiClient.get('/api/classrooms')
        .catch(err => {
          console.error('❌ Classrooms API failed:', err.response?.data || err.message)
          return { data: { success: false, count: 0, classrooms: [] } }
        })
        
      console.log('📡 Calling progressions API...')
      const progressionsRes = await apiClient.get('/api/progressions')
        .catch(err => {
          console.error('❌ Progressions API failed:', err.response?.data || err.message)
          return { data: { success: false, count: 0, data: [] } }
        })

      // 🔍 DEBUG: Log des réponses EXACTES
      console.log('📊 RÉPONSE USERS BRUTE:', usersRes.data)
      console.log('📊 RÉPONSE CLASSROOMS BRUTE:', classroomsRes.data)
      console.log('📊 RÉPONSE PROGRESSIONS BRUTE:', progressionsRes.data)

      // ✅ PARSING SELON TON FORMAT BACKEND
      
      // Users: { success: true, count: 5, data: [...] }
      let usersCount = 0
      if (usersRes.data && usersRes.data.success) {
        usersCount = usersRes.data.count || 0
        console.log('✅ Users count trouvé:', usersCount)
      } else {
        console.log('❌ Users API échec ou non authentifié')
      }

      // Classrooms: { success: true, count: 4, classrooms: [...] }
      let classroomsCount = 0
      if (classroomsRes.data) {
        if (typeof classroomsRes.data.count === 'number') {
          classroomsCount = classroomsRes.data.count
        } else if (Array.isArray(classroomsRes.data.classrooms)) {
          classroomsCount = classroomsRes.data.classrooms.length
        }
      }

      // Progressions: { success: true, count: 1, data: [...] }
      let progressionsCount = 0
      if (progressionsRes.data) {
        if (typeof progressionsRes.data.count === 'number') {
          progressionsCount = progressionsRes.data.count
        } else if (Array.isArray(progressionsRes.data.data)) {
          progressionsCount = progressionsRes.data.data.length
        }
      }

      const result = {
        usersCount,
        classroomsCount,
        progressionsCount,
        menusCount: 0
      }

      console.log('✅ Dashboard stats FINAL:', result)
      return result

    } catch (error) {
      console.error('❌ Dashboard fetch error:', error)
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Erreur lors du chargement des statistiques'
      )
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    usersCount: 0,
    classroomsCount: 0,
    progressionsCount: 0,
    menusCount: 0,
    loading: false,
    error: null,
    lastUpdated: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetStats: (state) => {
      state.usersCount = 0
      state.classroomsCount = 0
      state.progressionsCount = 0
      state.menusCount = 0
      state.error = null
      state.lastUpdated = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        console.log('⏳ Dashboard stats loading...')
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        console.log('✅ Dashboard stats loaded:', action.payload)
        state.loading = false
        state.error = null
        state.lastUpdated = new Date().toISOString()
        
        state.usersCount = action.payload.usersCount
        state.classroomsCount = action.payload.classroomsCount
        state.progressionsCount = action.payload.progressionsCount
        state.menusCount = action.payload.menusCount
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        console.error('❌ Dashboard stats failed:', action.payload)
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, resetStats } = dashboardSlice.actions
export default dashboardSlice.reducer