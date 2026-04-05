import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Modal } from "../../components/Modal.jsx";

function parseTags(tagsText) {
  return [...new Set(tagsText.split(",").map((tag) => tag.trim()).filter(Boolean))].slice(0, 3);
}

const cardSchema = z.object({
  question: z.string().trim().min(4, "Question must be at least 4 characters."),
  answer: z.string().trim().min(1, "Answer is required."),
  hint: z.string().trim().max(180, "Hint must stay under 180 characters.").optional(),
  tagsText: z
    .string()
    .refine((value) => parseTags(value).length <= 3, "Use up to 3 tags.")
});

const defaults = {
  question: "",
  answer: "",
  hint: "",
  tagsText: ""
};

export function CardEditorDrawer({ isOpen, initialValues, onClose, onSubmit, isPending }) {
  const form = useForm({
    resolver: zodResolver(cardSchema),
    defaultValues: defaults
  });

  useEffect(() => {
    form.reset({
      question: initialValues?.question || "",
      answer: initialValues?.answer || "",
      hint: initialValues?.hint || "",
      tagsText: initialValues?.tags?.join(", ") || ""
    });
  }, [form, initialValues, isOpen]);

  const submitHandler = form.handleSubmit(async (values) => {
    await onSubmit({
      question: values.question,
      answer: values.answer,
      hint: values.hint || "",
      tags: parseTags(values.tagsText)
    });
  });

  const isEditing = Boolean(initialValues);

  return (
    <Modal
      isOpen={isOpen}
      title={isEditing ? "Refine flashcard" : "Create flashcard"}
      description="Keep prompts concise and answers scannable for fast review sessions."
      onClose={onClose}
      actions={
        <>
          <button className="ghost-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="submit" form="card-form">
            {isPending ? "Saving..." : isEditing ? "Update Card" : "Add Card"}
          </button>
        </>
      }
    >
      <form id="card-form" className="form-grid" onSubmit={submitHandler}>
        <label className="field">
          <span>Question</span>
          <textarea rows="3" placeholder="Prompt shown on the front of the card" {...form.register("question")} />
          <small>{form.formState.errors.question?.message}</small>
        </label>

        <label className="field">
          <span>Answer</span>
          <textarea rows="5" placeholder="Answer shown when the card flips" {...form.register("answer")} />
          <small>{form.formState.errors.answer?.message}</small>
        </label>

        <label className="field">
          <span>Hint</span>
          <input placeholder="Optional memory hook" {...form.register("hint")} />
          <small>{form.formState.errors.hint?.message || "Helpful when a card needs an extra recall cue."}</small>
        </label>

        <label className="field">
          <span>Tags</span>
          <input placeholder="grammar, chapter 2, needs review" {...form.register("tagsText")} />
          <small>{form.formState.errors.tagsText?.message || "Optional. Use up to 3 short tags."}</small>
        </label>
      </form>
    </Modal>
  );
}
