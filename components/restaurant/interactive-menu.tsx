'use client'

import { BookMenu, type BookMenuPage } from './book-menu'

const menuPages: BookMenuPage[] = [
  {
    id: 'madhuban-menu-1',
    front: '/textures/menu/page1.jpg',
    back: '/textures/menu/page2.jpg',
    label: 'Dining menu pages one and two',
  },
  {
    id: 'madhuban-menu-2',
    front: '/textures/menu/page3.jpg',
    back: '/textures/menu/page4.jpg',
    label: 'Dining menu pages three and four',
  },
  {
    id: 'madhuban-menu-3',
    front: '/textures/menu/page5.jpg',
    back: '/textures/menu/page6.jpg',
    label: 'Dining menu pages five and six',
  },
  {
    id: 'madhuban-menu-4',
    front: '/textures/menu/page7.jpg',
    back: '/textures/menu/page8.jpg',
    label: 'Dining menu pages seven and eight',
  },
]

export function InteractiveMenu() {
  return <BookMenu pages={menuPages} />
}
