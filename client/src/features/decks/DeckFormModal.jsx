import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Modal } from "../../components/Modal.jsx";

const deckSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters."),
  description: z.string().trim().max(240, "Description must stay under 240 characters.").optional(),
  tagsText: z.string().optional(),
  colorTheme: z.enum(["ember", "ocean", "mint", "plum", "sunrise"])
});

const defaultValues = {
  title: "",
  description: "",
  tagsText: "",
  colorTheme: "ember"
};

export function DeckFormModal({ isOpen, initialValues, onClose, onSubmit, isPending }) {
  const form = useForm({
    resolver: zodResolver(deckSchema),
    defaultValues
  });

  useEffect(() => {
    form.reset({
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      tagsText: initialValues?.tags?.join(", ") || "",
      colorTheme: initialValues?.colorTheme || "ember"
    });
  }, [form, initialValues, isOpen]);

  const submitHandler = form.handleSubmit(async (values) => {
    const tags = values.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    await onSubmit({
      title: values.title,
      description: values.description || "",
      tags,
      colorTheme: values.colorTheme
    });
  });

  return (
    <Modal
      isOpen={isOpen}
      title={initialValues ? "Edit deck details" : "Create a new deck"}
      description="Build a focused study set with a clear title, theme, and tags."
      onClose={onClose}
      actions={
        <>
          <button className="ghost-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="submit" form="deck-form">
            {isPending ? "Saving..." : initialValues ? "Save Changes" : "Create Deck"}
          </button>
        </>
      }
    >
      <form id="deck-form" className="form-grid" onSubmit={submitHandler}>
        <label className="field">
          <span>Deck Title</span>
          <input placeholder="e.g. Biology Midterm" {...form.register("title")} />
          <small>{form.formState.errors.title?.message}</small>
        </label>

        <label className="field">
          <span>Description</span>
          <textarea rows="4" placeholder="What should this deck help you remember?" {...form.register("description")} />
          <small>{form.formState.errors.description?.message}</small>
        </label>

        <label className="field">
          <span>Tags</span>
          <input placeholder="memory, quiz, chapter 3" {...form.register("tagsText")} />
          <small>Separate tags with commas.</small>
        </label>

        <label className="field">
          <span>Color Theme</span>
          <select {...form.register("colorTheme")}>
            <option value="ember">Ember</option>
            <option value="ocean">Ocean</option>
            <option value="mint">Mint</option>
            <option value="plum">Plum</option>
            <option value="sunrise">Sunrise</option>
          </select>
        </label>
      </form>
    </Modal>
  );
}

