export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponseWrapper<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
  meta?: any;
}

class ApiClient {
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponseWrapper<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // If body is NOT FormData, set application/json
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include HTTP-only cookies
      });

      const json = await response.json().catch(() => ({
        success: false,
        message: response.statusText || 'Network request failed',
      }));

      if (!response.ok) {
        throw {
          status: response.status,
          message: json.message || 'API request failed',
          errors: json.errors || [],
        };
      }

      return json;
    } catch (error: any) {
      if (error.status) throw error;
      throw {
        status: 0,
        message: error.message || 'Cannot connect to backend server. Ensure backend is running on port 5000.',
        errors: [],
      };
    }
  }

  // --- Auth APIs ---
  public auth = {
    login: (usernameOrEmail: string, password: string) =>
      this.request<{ token: string; admin: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail, password }),
      }),

    logout: () =>
      this.request('/auth/logout', {
        method: 'POST',
      }),

    me: () =>
      this.request<{ admin: any }>('/auth/me', {
        method: 'GET',
      }),
  };

  // --- Registration APIs ---
  public registrations = {
    submit: (formData: FormData | Record<string, any>) => {
      if (formData instanceof FormData) {
        return this.request('/registrations', {
          method: 'POST',
          body: formData,
        });
      }
      return this.request('/registrations', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    },

    get: (id: string) =>
      this.request<any>(`/registrations/${id}`, {
        method: 'GET',
      }),
  };

  // --- Public Read APIs ---
  public public = {
    getSettings: () =>
      this.request<any>('/public/settings', {
        method: 'GET',
      }),

    getTeams: () =>
      this.request<any[]>('/public/teams', {
        method: 'GET',
      }),

    getTeamById: (id: string) =>
      this.request<any>(`/public/teams/${id}`, {
        method: 'GET',
      }),

    getMatches: (params?: { status?: string; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.limit) query.set('limit', String(params.limit));
      const qs = query.toString() ? `?${query.toString()}` : '';
      return this.request<any[]>(`/public/matches${qs}`, {
        method: 'GET',
      });
    },

    getScoreboard: () =>
      this.request<any>('/public/scoreboard', {
        method: 'GET',
      }),

    getStandings: () =>
      this.request<any[]>('/public/standings', {
        method: 'GET',
      }),
  };

  // --- Protected Admin APIs ---
  public admin = {
    getOverview: () =>
      this.request<any>('/admin/dashboard/overview', {
        method: 'GET',
      }),

    getActivity: () =>
      this.request<any[]>('/admin/dashboard/activity', {
        method: 'GET',
      }),

    getRegistrations: (params?: { search?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.status) query.set('status', params.status);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return this.request<any[]>(`/admin/registrations${qs}`, {
        method: 'GET',
      });
    },

    approveRegistration: (id: string) =>
      this.request<any>(`/admin/registrations/${id}/approve`, {
        method: 'PATCH',
      }),

    rejectRegistration: (id: string, reason?: string) =>
      this.request<any>(`/admin/registrations/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      }),

    getTeams: (params?: { search?: string; active?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.active) query.set('active', params.active);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return this.request<any[]>(`/admin/teams${qs}`, {
        method: 'GET',
      });
    },

    toggleTeamStatus: (id: string, isActive?: boolean) =>
      this.request<any>(`/admin/teams/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }),

    getMatches: (params?: { status?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return this.request<any[]>(`/admin/matches${qs}`, {
        method: 'GET',
      });
    },

    createMatch: (data: any) =>
      this.request<any>('/admin/matches', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateMatch: (id: string, data: any) =>
      this.request<any>(`/admin/matches/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    updateMatchScore: (id: string, data: any) =>
      this.request<any>(`/admin/matches/${id}/score`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    publishMatchScore: (id: string, data: any) =>
      this.request<any>(`/admin/matches/${id}/publish`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    deleteMatch: (id: string) =>
      this.request<any>(`/admin/matches/${id}`, {
        method: 'DELETE',
      }),

    getSettings: () =>
      this.request<any>('/admin/settings', {
        method: 'GET',
      }),

    updateSettings: (data: any) =>
      this.request<any>('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  };
}

export const api = new ApiClient();

