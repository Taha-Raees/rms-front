'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function TestAuthPage() {
  const router = useRouter();
  const { state, refreshAuth } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);

  const addResult = (test: string, result: string, success: boolean) => {
    setTestResults(prev => [...prev, { test, result, success, timestamp: new Date().toISOString() }]);
  };

  const testAuthAPI = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/auth/me`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('Auth API Test', `Success: ${JSON.stringify(data)}`, true);
      } else {
        addResult('Auth API Test', `Failed: ${response.status} ${response.statusText}`, false);
      }
    } catch (error) {
      addResult('Auth API Test', `Error: ${error}`, false);
    }
  };

  const testRefresh = async () => {
    try {
      const success = await refreshAuth();
      addResult('Token Refresh Test', `Success: ${success}`, success);
    } catch (error) {
      addResult('Token Refresh Test', `Error: ${error}`, false);
    }
  };

  const testProtectedAPI = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/products`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('Protected API Test', `Success: ${data.data?.length || 0} products`, true);
      } else {
        addResult('Protected API Test', `Failed: ${response.status} ${response.statusText}`, false);
      }
    } catch (error) {
      addResult('Protected API Test', `Error: ${error}`, false);
    }
  };

  const testLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        addResult('Logout Test', 'Success', true);
        router.push('/login');
      } else {
        addResult('Logout Test', `Failed: ${response.status} ${response.statusText}`, false);
      }
    } catch (error) {
      addResult('Logout Test', `Error: ${error}`, false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Authentication Test Page</h1>
          <p className="text-gray-600 mt-2">Test the JWT authentication system with refresh tokens</p>
        </div>

        {/* Auth State */}
        <Card>
          <CardHeader>
            <CardTitle>Current Auth State</CardTitle>
            <CardDescription>Current authentication status and user information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Authenticated:</strong> {state.isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>Loading:</strong> {state.isLoading ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {state.user ? `${state.user.email} (${state.user.role})` : 'None'}</p>
              <p><strong>Store:</strong> {state.store ? state.store.name : 'None'}</p>
              {state.error && <p><strong>Error:</strong> {state.error}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Tests</CardTitle>
            <CardDescription>Run various authentication tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button onClick={testAuthAPI}>Test Auth API</Button>
              <Button onClick={testRefresh}>Test Token Refresh</Button>
              <Button onClick={testProtectedAPI}>Test Protected API</Button>
              <Button onClick={testLogout} variant="destructive">Test Logout</Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Results from authentication tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">No tests run yet. Click the buttons above to run tests.</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{result.test}</h3>
                        <p className="text-sm mt-1">{result.result}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {result.success ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{new Date(result.timestamp).toLocaleTimeString()}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
