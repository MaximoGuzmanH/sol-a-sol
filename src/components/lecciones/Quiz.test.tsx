import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { CLAVE_PROGRESO } from "@/lib/progreso";
import { Quiz } from "./Quiz";

const props = {
  pregunta: "¿Qué es ahorrar?",
  opciones: ["Gastarlo todo", "Guardar una parte", "Perderlo"],
  correcta: 1,
  explicacion: "Guardar una parte es ahorrar.",
  leccionId: "ninos/ahorrar/el-chanchito",
};

function completadas(): string[] {
  const crudo = localStorage.getItem(CLAVE_PROGRESO);
  return crudo ? JSON.parse(crudo).completadas : [];
}

describe("Quiz", () => {
  beforeEach(() => localStorage.clear());

  it("muestra la pregunta y una opción por botón", () => {
    render(<Quiz {...props} />);
    expect(screen.getByRole("heading", { name: "¿Qué es ahorrar?" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("con una respuesta incorrecta anima a reintentar y no completa la lección", async () => {
    render(<Quiz {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Gastarlo todo" }));
    expect(screen.getByText(/¡Casi!/)).toBeInTheDocument();
    expect(screen.queryByText(props.explicacion, { exact: false })).not.toBeInTheDocument();
    expect(completadas()).toEqual([]);
    expect(screen.getByRole("button", { name: "Guardar una parte" })).toBeEnabled();
  });

  it("con la respuesta correcta felicita, explica y completa la lección", async () => {
    render(<Quiz {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Perderlo" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar una parte" }));
    expect(screen.getByText(/¡Muy bien!/)).toHaveTextContent(props.explicacion);
    expect(completadas()).toEqual(["ninos/ahorrar/el-chanchito"]);
    for (const boton of screen.getAllByRole("button")) expect(boton).toBeDisabled();
  });

  it("al acertar, mueve el foco al mensaje de felicitación (no se pierde en el body)", async () => {
    render(<Quiz {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Guardar una parte" }));
    expect(screen.getByText(/¡Muy bien!/)).toHaveFocus();
  });

  it("anuncia un segundo error aunque el mensaje sea el mismo texto", async () => {
    render(<Quiz {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Gastarlo todo" }));
    const primerMensaje = screen.getByText(/¡Casi!/);
    await userEvent.click(screen.getByRole("button", { name: "Perderlo" }));
    const segundoMensaje = screen.getByText(/¡Casi!/);
    expect(segundoMensaje).not.toBe(primerMensaje);
  });
});
