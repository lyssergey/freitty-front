import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Segmented } from "./segmented";

const options = [
  { value: "cards", label: "Cards" },
  { value: "table", label: "Table" },
  { value: "board", label: "Pipeline" },
] as const;

describe("Segmented", () => {
  it("exposes radio semantics", () => {
    render(
      <Segmented options={options} value="table" onChange={() => {}} label="View" layoutId="v" />,
    );
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Table" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Cards" })).not.toBeChecked();
  });

  it("selects with arrow keys, wrapping around", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState<(typeof options)[number]["value"]>("board");
      return (
        <Segmented
          options={options}
          value={value}
          onChange={(next) => {
            onChange(next);
            setValue(next);
          }}
          label="View"
          layoutId="v"
        />
      );
    }
    render(<Controlled />);

    await user.tab();
    expect(screen.getByRole("radio", { name: "Pipeline" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("cards");
    expect(screen.getByRole("radio", { name: "Cards" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Cards" })).toBeChecked();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("table");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith("board");
  });
});
