import vscode from 'vscode'
import { DocumentService } from '../../services/documents'
import { injectable } from 'inversify'
import { Installable } from 'extension/src/utils/installable'

@injectable()
export class OpenVirtualDocumentCommand extends Installable {
  public constructor(private readonly documents: DocumentService) {
    super()
  }

  public install() {
    super.install()

    return vscode.commands.registerTextEditorCommand(
      'vue.virtual.openAtCursor',
      this.onExecute.bind(this)
    )
  }

  private async onExecute() {
    const editor = vscode.window.activeTextEditor

    if (!editor) {
      return vscode.window.showInformationMessage(
        'There is no active Vue document.'
      )
    }

    const uri = editor.document.uri.toString()

    if (!/\.vue$/.test(uri)) {
      return vscode.window.showInformationMessage(
        'There is no active Vue document.'
      )
    }

    const position = editor.selection.start

    const container = await this.documents.getVueDocument(uri)
    const block = container?.blockAt(position)
    const document = block ? container?.getBlockDocument(block) : null

    if (!document) {
      return vscode.window.showInformationMessage(
        'There is no virtual document at cursor.'
      )
    }

    const virtualUri = vscode.Uri.parse(document.uri)
    const ref = await vscode.workspace.openTextDocument(virtualUri)

    vscode.window.showTextDocument(ref, {
      viewColumn: vscode.ViewColumn.Beside,
      preserveFocus: true,
      preview: true,
      selection: editor.selection,
    })
  }
}
