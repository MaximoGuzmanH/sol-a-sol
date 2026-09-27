import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Acerca from "./page";

it("explica el proyecto, aclara que no es asesoría y enlaza las fuentes oficiales", () => {
  render(<Acerca />);
  expect(screen.getByRole("heading", { level: 1, name: "Acerca de Sol a Sol" })).toBeInTheDocument();
  expect(screen.getByText(/no es asesoría financiera/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /SBS/ })).toHaveAttribute("href", "https://www.sbs.gob.pe");
  expect(screen.getByRole("link", { name: /BCRP/ })).toHaveAttribute("href", "https://www.bcrp.gob.pe");
});
