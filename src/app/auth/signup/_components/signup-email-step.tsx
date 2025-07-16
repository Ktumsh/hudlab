import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { SignupFormData } from "@/lib/form-schemas";
import type { Control } from "react-hook-form";

interface SignupInfoStepProps {
  control: Control<SignupFormData>;
}

const SignupInfoStep = ({ control }: SignupInfoStepProps) => {
  return (
    <>
      <FormField
        control={control}
        name="displayName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Tu nombre" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo electrónico</FormLabel>
            <FormControl>
              <Input {...field} type="email" placeholder="Tu correo" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default SignupInfoStep;
