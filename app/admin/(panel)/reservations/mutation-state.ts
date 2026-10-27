export type AdminReservationMutationState = {
  success: boolean;
  error: string | null;
  message: string | null;
};

export const initialAdminReservationMutationState: AdminReservationMutationState =
  {
    success: false,
    error: null,
    message: null,
  };

export type AdminCreateReservationState = {
  success: boolean;
  error: string | null;
  message: string | null;
  reference: string | null;
  fields?: Record<string, string>;
};

export const initialAdminCreateReservationState: AdminCreateReservationState = {
  success: false,
  error: null,
  message: null,
  reference: null,
};
