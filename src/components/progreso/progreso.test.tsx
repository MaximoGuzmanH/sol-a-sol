import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { CLAVE_PROGRESO } from "@/lib/progreso";
import { moduloDePrueba } from "./datosDePrueba";
import { ListaLecciones } from "./ListaLecciones";
import { MapaModulos } from "./MapaModulos";

function guardarCompletadas(ids: string[]) {
  localStorage.setItem(CLAVE_PROGRESO, JSON.stringify({ version: 1, completadas: ids }));
}

beforeEach(() => localStorage.clear());

describe("MapaModulos", () => {
  it("sin progreso muestra 0 lecciones, sin insignia ni botón de reinicio", () => {
    render(<MapaModulos grupo="ninos" modulos={[moduloDePrueba()]} />);
    expect(screen.getByRole("link", { name: /^Ahorrar/ })).toHaveAttribute("href", "/ninos/ahorrar");
    expect(screen.getByText("0 de 2 lecciones")).toBeInTheDocument();
    expect(screen.queryByText(/Insignia/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Empezar de nuevo" })).not.toBeInTheDocument();
  });

  it("muestra el avance y la insignia al completar el módulo", () => {
    guardarCompletadas(["ninos/ahorrar/l1", "ninos/ahorrar/l2"]);
    render(<MapaModulos grupo="ninos" modulos={[moduloDePrueba()]} />);
    expect(screen.getByText("2 de 2 lecciones")).toBeInTheDocument();
    expect(screen.getByText("Insignia: Ahorrar")).toBeInTheDocument();
  });

  it("reinicia el progreso solo después de confirmar dentro de la página", async () => {
    guardarCompletadas(["ninos/ahorrar/l1"]);
    render(<MapaModulos grupo="ninos" modulos={[moduloDePrueba()]} />);
    expect(screen.getByText("1 de 2 lecciones")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Empezar de nuevo" }));
    await userEvent.click(screen.getByRole("button", { name: "No, volver" }));
    expect(screen.getByText("1 de 2 lecciones")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Empezar de nuevo" }));
    expect(screen.getByText(/Se borrará todo tu avance/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Sí, borrar" }));
    expect(screen.getByText("0 de 2 lecciones")).toBeInTheDocument();
    expect(localStorage.getItem(CLAVE_PROGRESO)).toBeNull();
    expect(screen.queryByRole("button", { name: "Empezar de nuevo" })).not.toBeInTheDocument();
  });
});

describe("ListaLecciones", () => {
  it("enlaza cada lección y marca las completadas", () => {
    guardarCompletadas(["ninos/ahorrar/l1"]);
    render(<ListaLecciones grupo="ninos" modulo={moduloDePrueba()} />);
    expect(screen.getByRole("link", { name: /Lección 1.*\(completada\)/ })).toHaveAttribute("href", "/ninos/ahorrar/l1");
    expect(screen.getByRole("link", { name: /Lección 2/ })).not.toHaveTextContent("(completada)");
    expect(screen.getByText("1 de 2 lecciones")).toBeInTheDocument();
  });
});
