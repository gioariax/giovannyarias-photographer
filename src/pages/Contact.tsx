import React from 'react';
import { useForm } from 'react-hook-form';
import { Backdrop, ContainerCentered } from '../components/SharedStyled';
import styled from 'styled-components';

type FormData = {
  name: string;
  email: string;
  message: string;
};

export const ContactContainer = styled.div`
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
`;

export const FormContainer = styled.div`
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
`;

const Contact: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<FormData>();
  const [serverResponse, setServerResponse] = React.useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setServerResponse(null);
    try {
      const response = await fetch('https://5ftuls8bej.execute-api.eu-west-2.amazonaws.com/PROD/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setServerResponse('Mensaje enviado correctamente.');
        reset();
      } else {
        setServerResponse('Error al enviar el mensaje.');
      }
    } catch (e) {
      setServerResponse('Error de red al enviar el mensaje.');
    }
  };

  return (
    <Backdrop>
      <ContainerCentered>
        <ContactContainer>
          <FormContainer>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: 16 }}>
                  <label>Nombre</label>
                <input {...register('name', { required: 'El nombre es obligatorio' })} />
                {errors.name && <span style={{ color: 'red' }}>{errors.name.message}</span>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Email</label>
                <input type="email" {...register('email', { required: 'El email es obligatorio' })} />
                {errors.email && <span style={{ color: 'red' }}>{errors.email.message}</span>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Mensaje</label>
                <textarea {...register('message', { required: 'El mensaje es obligatorio' })} rows={5} />
                {errors.message && <span style={{ color: 'red' }}>{errors.message.message}</span>}
              </div>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </button>
            </form>
          </FormContainer>
          {serverResponse && <div style={{ marginTop: 16 }}>{serverResponse}</div>}
        </ContactContainer>
      </ContainerCentered>
    </Backdrop>
  );
};

export default Contact;
