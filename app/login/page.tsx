'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Store, Lock, Mail, ShoppingBag, Zap, Shirt, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background with gradient and image */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900"
        style={{
          backgroundImage: `url('/loginbg.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      />

      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md h-full flex items-center justify-center">
          <div className="bg-[#9b1f53]/10 backdrop-blur-sm p-8 shadow-2xl border border-white/20 min-h-[600px] w-full flex flex-col justify-center">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-2">Retail Management</h1>
            <p className="text-purple-200 text-lg">Sign in to your store dashboard</p>
          </div>

          {/* Login Form */}
          
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/20 mb-6">
                <TabsTrigger value="manual" className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-900">Login</TabsTrigger>
                <TabsTrigger value="grocery" className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-900">Grocery</TabsTrigger>
                <TabsTrigger value="electronics" className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-900">Electronics</TabsTrigger>
                <TabsTrigger value="clothing" className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-900">Clothing</TabsTrigger>
              </TabsList>

              {/* Manual Login Tab */}
              <TabsContent value="manual">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 h-5 w-5" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="pl-12 pr-4 py-3 bg-white/20 border-white/30 text-white placeholder:text-purple-200 focus:border-white focus:ring-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 h-5 w-5" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className="pl-12 pr-12 py-3 bg-white/20 border-white/30 text-white placeholder:text-purple-200 focus:border-white focus:ring-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="bg-red-500/20 border-red-500/30 text-white">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                      <ShoppingBag className="h-8 w-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Fresh Market Grocery</h3>
                      <p className="text-purple-200">Complete grocery store experience</p>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg space-y-2">
                    <div className="text-purple-200 text-sm">
                      <strong className="text-white">Email:</strong> grocery@store.com
                    </div>
                    <div className="text-purple-200 text-sm">
                      <strong className="text-white">Password:</strong> password123
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="bg-red-500/20 border-red-500/30 text-white">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
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
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Zap className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Tech Hub Electronics</h3>
                      <p className="text-purple-200">Advanced electronics inventory</p>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg space-y-2">
                    <div className="text-purple-200 text-sm">
                      <strong className="text-white">Email:</strong> electronics@store.com
                    </div>
                    <div className="text-purple-200 text-sm">
                      <strong className="text-white">Password:</strong> password123
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="bg-red-500/20 border-red-500/30 text-white">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
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
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Shirt className="h-8 w-8 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Fashion Hub</h3>
                      <p className="text-purple-200">Fashion retail showcase</p>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg space-y-2">
                    <div className="text-purple-200 text-sm">
                      <strong className="text-white">Email:</strong> clothing@store.com
                    </div>
                    <div className="text-purple-200 text-sm">
                      <strong className="text-white">Password:</strong> password123
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="bg-red-500/20 border-red-500/30 text-white">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
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
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Access Demo'
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Right side - Illustration placeholder */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 relative z-10">
        <div className="w-full h-full flex items-center justify-center text-white/50">
          <div className="text-center max-w-md">
            
          </div>
        </div>
      </div>
    </div>
  );
}
