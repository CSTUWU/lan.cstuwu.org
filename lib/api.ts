const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL || 'https://lan-chalange-backend.vercel.app/api';
const cleanUrl = rawApiUrl.replace(/\/+$/, '');
export const API_BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

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

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (typeof window !== 'undefined') {
      try {
        const jwt = localStorage.getItem('cst_admin_jwt');
        if (jwt && !headers['Authorization']) {
          headers['Authorization'] = `Bearer ${jwt}`;
        }
        const isAuth =
          localStorage.getItem('cst_lan_admin_auth') === 'authenticated' ||
          localStorage.getItem('cst_admin_authenticated') === 'authenticated' ||
          document.cookie.includes('cst_lan_admin_auth=authenticated');
        if (isAuth && !headers['X-Admin-Auth']) {
          headers['X-Admin-Auth'] = 'authenticated';
        }
      } catch (e) {
      }
    }

    const targetUrls: string[] = [];
    if (typeof window !== 'undefined') {
      const isLocalHost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      if (isLocalHost) {
        // Prioritize local backend on port 5000 when developing locally
        targetUrls.push(`http://localhost:5000/api${endpoint}`);
        if (!url.includes('localhost:5000')) {
          targetUrls.push(url);
        }
      } else {
        targetUrls.push(url);
        if (!url.includes('lan-chalange-backend.vercel.app')) {
          targetUrls.push(`https://lan-chalange-backend.vercel.app/api${endpoint}`);
        }
      }
    } else {
      targetUrls.push(url);
    }

    let lastError: any = null;

    for (const targetUrl of targetUrls) {
      try {
        const response = await fetch(targetUrl, {
          ...options,
          headers,
          credentials: 'include', // Include HTTP-only cookies
        });

        const json = await response.json().catch(() => ({
          success: false,
          message: response.statusText || 'Network request failed',
        }));

        if (!response.ok) {
          const rawMessage = json.message || 'API request failed';
          const detailedMessage =
            json.errors && json.errors.length > 0 && !rawMessage.includes(':')
              ? `${rawMessage}: ${json.errors.map((e: any) => e.message || `${e.field || 'field'} is invalid`).join('; ')}`
              : rawMessage;

          // If 5xx server error and there is another fallback URL, try it
          if (response.status >= 500 && targetUrl !== targetUrls[targetUrls.length - 1]) {
            lastError = {
              status: response.status,
              message: detailedMessage,
              errors: json.errors || [],
            };
            continue;
          }
          throw {
            status: response.status,
            message: detailedMessage,
            errors: json.errors || [],
          };
        }

        return json;
      } catch (error: any) {
        lastError = error;
        // If there's another target URL, continue loop
        if (targetUrl !== targetUrls[targetUrls.length - 1]) {
          continue;
        }
      }
    }

    if (lastError?.status) throw lastError;
    throw {
      status: 0,
      message: lastError?.message || 'Cannot connect to backend server. Ensure backend is running.',
      errors: [],
    };
  }

  public auth = {
    login: async (usernameOrEmail: string, password: string) => {
      const res = await this.request<{ token: string; admin: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail, password }),
      });
      if (res.success && res.data?.token && typeof window !== 'undefined') {
        try {
          localStorage.setItem('cst_admin_jwt', res.data.token);
          localStorage.setItem('cst_lan_admin_auth', 'authenticated');
        } catch (e) {}
      }
      return res;
    },

    logout: async () => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('cst_admin_jwt');
          localStorage.removeItem('cst_lan_admin_auth');
        } catch (e) {}
      }
      return this.request('/auth/logout', {
        method: 'POST',
      });
    },

    me: () =>
      this.request<{ admin: any }>('/auth/me', {
        method: 'GET',
      }),
  };

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

    getPlayoffBracket: () =>
      this.request<any>('/public/matches/bracket', {
        method: 'GET',
      }),

    getPlayers: () =>
      this.request<any[]>('/public/players', {
        method: 'GET',
      }),
  };

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

    getPlayers: (params?: { search?: string; teamTag?: string; degree?: string; year?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.teamTag) query.set('teamTag', params.teamTag);
      if (params?.degree) query.set('degree', params.degree);
      if (params?.year) query.set('year', params.year);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return this.request<any[]>(`/admin/players${qs}`, {
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

    generatePlayoffs: (data?: { recreate?: boolean }) =>
      this.request<any>('/admin/matches/generate-playoffs', {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }),

    recreatePlayoffs: () =>
      this.request<any>('/admin/matches/recreate-playoffs', {
        method: 'POST',
        body: JSON.stringify({ recreate: true }),
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

