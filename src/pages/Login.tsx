import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import { useForm } from '@tanstack/react-form';
import type { LoginDto, LoginResponse } from '../types/auth';
import { z } from 'zod';
import { loginUser } from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import FieldInfo from '../components/FieldInfo';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const mutation = useMutation<LoginResponse, Error, LoginDto>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data);
      navigate('/dashboard');
    },
    onError: (err) => {
      console.error('Erro no login:', err);
    },
  });

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: ({value}) => {
      mutation.mutate(value);
    },
    validators: {
      onSubmit: z.object({
        email: z.email('Email deve ser válido').min(1, 'Email é obrigatório'),
        password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
      }),
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">Login</h2>
        <form onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }} className="space-y-2">
          <form.Field 
            name="email" 
            children={(field) => {
             return (
             <>
              <InputField 
                type="email"
                label="Email"
                name="email"
                required={true}
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                />
              <FieldInfo field={field} />
             </>
             )
            }}
          />
          <form.Field 
            name="password" 
            children={(field) => {
             return (
             <>
             <InputField 
              type="password"
              label="Senha"
              name="password"
              required={true}
              value={field.state.value}
              onChange={(value) => field.handleChange(value)}
              />
             <FieldInfo field={field} />
             </>
             )
            }}
          />
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button label="Entrar" onClick={() => form.handleSubmit()} type="submit" disabled={!canSubmit} loading={isSubmitting} />
            )}
          />
        </form>
      </div>
    </div>
  );
};

export default Login;