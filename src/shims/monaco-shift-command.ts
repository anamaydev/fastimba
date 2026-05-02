/*
* ShiftCommand Shim
* - Provide a minimal re-implementation of Monaco's internal ShiftCommand class.
* - monaco-vim uses this for >> and << (indent/outdent) vim operations.
* - The original class lives deep inside monaco-editor internals and is not
*   exposed on window.monaco, so it cannot be proxied like the other exports.
* */

export class ShiftCommand {
  /* Store the range of lines to indent/outdent */
  private _range: any;
  /* Store options like isUnshift (outdent), tabSize, indentSize, insertSpaces */
  private _opts: { isUnshift: boolean; tabSize: number; indentSize: number; insertSpaces: boolean };

  /* Receive the line range and indent options from monaco-vim */
  constructor(range: any, opts: any) {
    this._range = range;
    this._opts = opts;
  }

  /* Compute text edits to apply to the document (called by Monaco's command system) */
  getEditOperations(model: any, builder: any) {
    /* Read indent settings from the options passed by monaco-vim */
    const { indentSize, insertSpaces } = this._opts;
    /* Build the indent string: spaces or a tab character */
    const indent = insertSpaces ? ' '.repeat(indentSize) : '\t';
    /* Get the Range constructor from the global monaco instance */
    const RangeClass = window.monaco.Range;

    /* Loop through each line in the selected range */
    for (let i = this._range.startLineNumber; i <= this._range.endLineNumber; i++) {
      /* Get the current text content of this line */
      const line = model.getLineContent(i);

      if (this._opts.isUnshift) {
        /* Remove one level of indentation (one tab or up to indentSize spaces) from line start */
        const match = line.match(new RegExp(`^(\t| {1,${indentSize}})`));
        if (match) {
          /* Replace the matched whitespace at the start with empty string */
          builder.addEditOperation(new RangeClass(i, 1, i, match[0].length + 1), '');
        }
      } else {
        /* Insert one level of indentation at the start of the line */
        builder.addEditOperation(new RangeClass(i, 1, i, 1), indent);
      }
    }
  }

  /* Determine where the cursor should end up after edits (called by Monaco's command system) */
  computeCursorState(model: any) {
    /* Select from start of first line to end of last line in the range */
    return new window.monaco.Selection(
      this._range.startLineNumber, 1,
      this._range.endLineNumber, model.getLineMaxColumn(this._range.endLineNumber)
    );
  }
}