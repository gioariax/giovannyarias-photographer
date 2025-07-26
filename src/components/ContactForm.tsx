import React from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import {
  Button,
  Field,
  Fieldset,
  Input,
  Stack,
  Textarea,
} from "@chakra-ui/react"

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

export const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  gap: 24px;
`;

interface ContactFormProps {
  onCancel?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onCancel }) => {
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
        if (onCancel) {
          onCancel();
        }
      } else {
        setServerResponse('Error al enviar el mensaje.');
      }
    } catch (e) {
      setServerResponse('Error de red al enviar el mensaje.');
    }
  };

  return (
    <Fieldset.Root size="lg" maxW="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Fieldset.Content>
            <Field.Root>
              <Field.Label>Name</Field.Label>
              <Input size="lg" {...register('name', { required: 'El nombre es obligatorio' })} />
            </Field.Root>
            <Field.Root>
              <Field.Label>Email address</Field.Label>
              <Input size="lg" {...register('email', { required: 'El email es obligatorio' })} type="email" />
            </Field.Root>
            <Field.Root>
              <Field.Label>Message</Field.Label>
              <Textarea size="lg" {...register('message', { required: 'El mensaje es obligatorio' })} />
            </Field.Root>
          </Fieldset.Content>
          <ActionsContainer>
            <Button type="button" variant="ghost" onClick={onCancel} alignSelf="flex-start">
                Cancel
            </Button>
            <Button type="submit" alignSelf="flex-start" disabled={isSubmitting}>
                Send
            </Button>
          </ActionsContainer>
        </Stack>
      </form>
    </Fieldset.Root>
  );
};

export default ContactForm;
