import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Portada from "./page";

it("ofrece el grupo Niños y marca los demás como próximamente", () => {
  render(<Portada />);
  expect(screen.getByRole("link", { name: /Niños/ })).toHaveAttribute("href", "/ninos");
  expect(screen.getAllByText("Próximamente")).toHaveLength(2);
  expect(screen.queryByRole("link", { name: /Jóvenes/ })).not.toBeInTheDocument();
});
