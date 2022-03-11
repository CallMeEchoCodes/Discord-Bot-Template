export interface Event {
  trigger: string
  type: 'on' | 'once'
  run: Function
}
