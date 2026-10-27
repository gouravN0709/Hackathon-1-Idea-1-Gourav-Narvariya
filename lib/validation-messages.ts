/** English defaults for client and server-side validation. */
export const defaultValidationMessages = {
  chooseArrivalDate: "Choose an arrival date.",
  datePast: "Choose a date that has not already passed.",
  closedWeekdays:
    "The cider house is open Thursday to Sunday. Monday to Wednesday are closed.",
  chooseArrivalTime: "Choose an arrival time.",
  adultsRange: (min: number, max: number) =>
    `Adults must be between ${min} and ${max}.`,
  childrenRange: (min: number, max: number) =>
    `Children must be between ${min} and ${max}.`,
  nameRequired: "Enter the name of the person making the request.",
  emailInvalid: "Enter a valid email address.",
  phoneInvalid: "Enter a telephone number with 8 to 15 digits.",
  notesMax: "Keep notes to 800 characters.",
} as const;

export type ValidationMessages = {
  chooseArrivalDate: string;
  datePast: string;
  closedWeekdays: string;
  chooseArrivalTime: string;
  adultsRange: string;
  childrenRange: string;
  nameRequired: string;
  emailInvalid: string;
  phoneInvalid: string;
  notesMax: string;
};

export function buildValidationMessages(minMax: {
  adultMin: number;
  adultMax: number;
  childMin: number;
  childMax: number;
}): ValidationMessages {
  return {
    chooseArrivalDate: defaultValidationMessages.chooseArrivalDate,
    datePast: defaultValidationMessages.datePast,
    closedWeekdays: defaultValidationMessages.closedWeekdays,
    chooseArrivalTime: defaultValidationMessages.chooseArrivalTime,
    adultsRange: defaultValidationMessages.adultsRange(
      minMax.adultMin,
      minMax.adultMax,
    ),
    childrenRange: defaultValidationMessages.childrenRange(
      minMax.childMin,
      minMax.childMax,
    ),
    nameRequired: defaultValidationMessages.nameRequired,
    emailInvalid: defaultValidationMessages.emailInvalid,
    phoneInvalid: defaultValidationMessages.phoneInvalid,
    notesMax: defaultValidationMessages.notesMax,
  };
}
