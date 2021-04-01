import Translation from './Translation'

export default interface Entry {
  key: string
  comment: string
  translations: Translation[]
}
