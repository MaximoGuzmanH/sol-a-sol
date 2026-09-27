import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dato } from "./Dato";
import { Imagen } from "./Imagen";
import { ParaAdultos } from "./ParaAdultos";
import { Personaje } from "./Personaje";

describe("Personaje", () => {
  it("muestra lo que dice Vicu", () => {
    render(<Personaje>¡Hola, soy Vicu!</Personaje>);
    expect(screen.getByRole("complementary", { name: "Vicu dice" })).toHaveTextContent("¡Hola, soy Vicu!");
  });
});

describe("Dato", () => {
  it("destaca la idea clave", () => {
    render(<Dato>Ahorrar es guardar.</Dato>);
    expect(screen.getByText("Idea clave")).toBeInTheDocument();
    expect(screen.getByText("Ahorrar es guardar.")).toBeInTheDocument();
  });
});

describe("ParaAdultos", () => {
  it("empieza cerrado y tiene el título para adultos", () => {
    const { container } = render(<ParaAdultos>Pregúntele algo.</ParaAdultos>);
    expect(container.querySelector("details")).not.toHaveAttribute("open");
    expect(screen.getByText("Para papás y profes")).toBeInTheDocument();
  });
});

describe("Imagen", () => {
  it("muestra la imagen con su texto alternativo", () => {
    render(<Imagen src="/ilustraciones/chanchito.svg" alt="Un chanchito de ahorro" />);
    expect(screen.getByRole("img", { name: "Un chanchito de ahorro" })).toBeInTheDocument();
  });

  it("falla si no tiene texto alternativo", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Imagen src="/x.svg" alt=" " />)).toThrow(/texto alternativo/);
  });
});
