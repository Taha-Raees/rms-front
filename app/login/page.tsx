'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Store, Lock, Mail, ShoppingBag, Zap, Shirt } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Store className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Retail Management</h1>
          <p className="text-muted-foreground mt-2">Sign in to your store dashboard</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Store Login</CardTitle>
            <CardDescription>
              Choose your login method or explore demo stores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="manual">Login</TabsTrigger>
                <TabsTrigger value="grocery">Grocery</TabsTrigger>
                <TabsTrigger value="electronics">Electronics</TabsTrigger>
                <TabsTrigger value="clothing">Clothing</TabsTrigger>
              </TabsList>

              {/* Manual Login Tab */}
              <TabsContent value="manual">
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>



              {/* Grocery Store Demo */}
              <TabsContent value="grocery">
                <div className="mt-4 space-y-4">
                  <div className="text-center space-y-2">
                    <ShoppingBag className="h-12 w-12 mx-auto text-green-600" />
                    <h3 className="text-lg font-semibold text-foreground">Fresh Market Grocery</h3>
                    <p className="text-sm text-muted-foreground">Complete grocery store experience</p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="text-sm">
                      <strong>Email:</strong> grocery@store.com
                    </div>
                    <div className="text-sm">
                      <strong>Password:</strong> password123
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    className="w-full"
                    onClick={async () => {
                      setIsLoading(true);
                      setError('');
                      try {
                        const result = await login('grocery@store.com', 'password123');
                        if (result.success) {
                          router.push('/');
                          router.refresh();
                        } else {
                          setError(result.error || 'Login failed');
                        }
                      } catch (error: any) {
                        console.error('Login error:', error);
                        setError(error.message || 'An error occurred during login');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Access Demo'
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Electronics Store Demo */}
              <TabsContent value="electronics">
                <div className="mt-4 space-y-4">
                  <div className="text-center space-y-2">
                    <Zap className="h-12 w-12 mx-auto text-yellow-600" />
                    <h3 className="text-lg font-semibold text-foreground">Tech Hub Electronics</h3>
                    <p className="text-sm text-muted-foreground">Advanced electronics inventory</p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="text-sm">
                      <strong>Email:</strong> electronics@store.com
                    </div>
                    <div className="text-sm">
                      <strong>Password:</strong> password123
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    className="w-full"
                    onClick={async () => {
                      setIsLoading(true);
                      setError('');
                      try {
                        const result = await login('electronics@store.com', 'password123');
                        if (result.success) {
                          router.push('/');
                          router.refresh();
                        } else {
                          setError(result.error || 'Login failed');
                        }
                      } catch (error: any) {
                        console.error('Login error:', error);
                        setError(error.message || 'An error occurred during login');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Access Demo'
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Clothing Store Demo */}
              <TabsContent value="clothing">
                <div className="mt-4 space-y-4">
                  <div className="text-center space-y-2">
                    <Shirt className="h-12 w-12 mx-auto text-pink-600" />
                    <h3 className="text-lg font-semibold text-foreground">Fashion Hub</h3>
                    <p className="text-sm text-muted-foreground">Fashion retail showcase</p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="text-sm">
                      <strong>Email:</strong> clothing@store.com
                    </div>
                    <div className="text-sm">
                      <strong>Password:</strong> password123
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    className="w-full"
                    onClick={async () => {
                      setIsLoading(true);
                      setError('');
                      try {
                        const result = await login('clothing@store.com', 'password123');
                        if (result.success) {
                          router.push('/');
                          router.refresh();
                        } else {
                          setError(result.error || 'Login failed');
                        }
                      } catch (error: any) {
                        console.error('Login error:', error);
                        setError(error.message || 'An error occurred during login');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Access Demo'
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
