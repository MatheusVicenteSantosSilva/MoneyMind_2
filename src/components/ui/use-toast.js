import React from "react";

const TOAST_LIMIT = 5; // limite de toasts simultâneos
const TOAST_REMOVE_DELAY = 5000; // 5s

// Estado global dos toasts
let memoryState = { toasts: [] };
const listeners = [];

// Reducer
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };
    case "DISMISS_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          action.toastId ? (t.id === action.toastId ? { ...t, open: false } : t) : { ...t, open: false }
        ),
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: action.toastId
          ? state.toasts.filter((t) => t.id !== action.toastId)
          : [],
      };
    default:
      return state;
  }
};

// Dispatch
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

// Gerador de IDs
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

// Função toast() para adicionar novo toast
const toast = (props) => {
  const id = genId();

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  const update = (props) => dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // Remove automático após TOAST_REMOVE_DELAY
  setTimeout(() => dismiss(), TOAST_REMOVE_DELAY);

  return { id, dismiss, update };
};

// Hook
function useToast() {
  const [state, setState] = React.useState(memoryState);

  // Subscreve listeners
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
