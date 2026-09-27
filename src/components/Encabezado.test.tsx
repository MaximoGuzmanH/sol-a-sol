import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Encabezado } from "./Encabezado";

it("enlaza al inicio y a la página Acerca", () => {
  render(<Encabezado />);
  expect(screen.getByRole("link", { name: "Sol a Sol" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "Acerca" })).toHaveAttribute("href", "/acerca");
});
