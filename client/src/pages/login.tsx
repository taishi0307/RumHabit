import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, setAuthToken } from "@/lib/queryClient";
import { loginSchema, insertUserSchema } from "@shared/schema";

const registrationSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  confirmPassword: z.string().min(8, "パスワードは8文字以上で入力してください"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegistrationData = z.infer<typeof registrationSchema>;

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registrationForm = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Debug form state
  const registrationFormState = registrationForm.watch();
  console.log("Registration form state:", registrationFormState);
  console.log("Registration form errors:", registrationForm.formState.errors);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        setAuthToken(data.token);
      }
      toast({
        title: "ログインしました",
        description: "アプリケーションへようこそ"
      });
      window.location.href = "/";
    },
    onError: (error) => {
      toast({
        title: "ログインに失敗しました",
        description: "メールアドレスとパスワードを確認してください",
        variant: "destructive"
      });
    }
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      // Remove confirmPassword from the data sent to the server
      const { confirmPassword, ...registrationData } = data;
      const response = await apiRequest("POST", "/api/auth/register", registrationData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        setAuthToken(data.token);
        toast({
          title: "アカウントを作成しました",
          description: "登録が完了しました。"
        });
        window.location.href = "/";
      } else {
        toast({
          title: "アカウントを作成しました",
          description: "登録が完了しました。ログインしてください。"
        });
        setIsLogin(true);
        registrationForm.reset();
      }
    },
    onError: (error) => {
      console.error("Registration error:", error);
      toast({
        title: "登録に失敗しました",
        description: "入力内容を確認してもう一度お試しください",
        variant: "destructive"
      });
    }
  });

  const handleLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const handleRegister = (data: RegistrationData) => {
    registrationMutation.mutate(data);
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ backgroundColor: 'hsl(0, 0%, 97.6%)' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? "ログイン" : "アカウント作成"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "アカウントにログインしてください" : "新しいアカウントを作成してください"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLogin ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="メールアドレスを入力"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>パスワード</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="パスワードを入力"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "ログイン中..." : "ログイン"}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reg-email">メールアドレス</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="メールアドレスを入力"
                  value={registrationForm.watch("email")}
                  onChange={(e) => registrationForm.setValue("email", e.target.value)}
                />
                {registrationForm.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {registrationForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="reg-password">パスワード</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="パスワードを入力"
                    value={registrationForm.watch("password")}
                    onChange={(e) => registrationForm.setValue("password", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {registrationForm.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {registrationForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="reg-confirm-password">パスワード確認</Label>
                <div className="relative">
                  <Input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="パスワードを再入力"
                    value={registrationForm.watch("confirmPassword")}
                    onChange={(e) => registrationForm.setValue("confirmPassword", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {registrationForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {registrationForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              
              <Button 
                type="button"
                className="w-full"
                disabled={registrationMutation.isPending}
                onClick={async () => {
                  const formData = registrationForm.getValues();
                  const validation = registrationSchema.safeParse(formData);
                  
                  if (!validation.success) {
                    validation.error.errors.forEach((error) => {
                      registrationForm.setError(error.path[0] as keyof RegistrationData, {
                        message: error.message,
                      });
                    });
                    return;
                  }
                  
                  handleRegister(formData);
                }}
              >
                {registrationMutation.isPending ? "作成中..." : "アカウント作成"}
              </Button>
            </div>
          )}
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">または</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Googleでログイン
          </Button>
          
          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? "アカウントをお持ちでない方はこちら" : "既にアカウントをお持ちの方はこちら"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}