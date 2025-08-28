export interface Track {
  id: string
  title: string
  artists: string
  custom: string
  mood: string
  energy: number
  genre: string
  year: number
  type: string
}

export interface Tracklist {
  id: string
  name: string
  tracks: Track[]
}

export const tracklists: Tracklist[] = [
  {
    id: 'tl1',
    name: 'Set de Prueba 1',
    tracks: [
      {
        id: 't1',
        title: 'Dub Me Back',
        artists: 'DJ DLG ft. B. Martin',
        custom: 'Rework',
        mood: 'mood 1',
        energy: 5,
        genre: 'Pumping House',
        year: 2023,
        type: 'Original Mix',
      },
      {
        id: 't2',
        title: 'Fear Factory',
        artists: 'Cleeny',
        custom: 'Edit',
        mood: 'mood 2',
        energy: 4,
        genre: 'Techno',
        year: 2024,
        type: 'Remix',
      },
      {
        id: 't3',
        title: 'Find My',
        artists: 'Wody Beats & Style',
        custom: 'Mashup',
        mood: 'mood 3',
        energy: 3,
        genre: 'Trance',
        year: 2023,
        type: 'Bootleg',
      },
    ],
  },
  {
    id: 'tl2',
    name: 'Set de Prueba 2',
    tracks: [
      {
        id: 't4',
        title: 'In My Soul',
        artists: 'Golhard',
        custom: 'Extended',
        mood: 'mood 1',
        energy: 2,
        genre: 'House',
        year: 2022,
        type: 'Original Mix',
      },
      {
        id: 't5',
        title: 'Everything Club',
        artists: 'Safe-ID',
        custom: 'Rework',
        mood: 'mood 2',
        energy: 5,
        genre: 'Trance',
        year: 2024,
        type: 'Bootleg',
      },
    ],
  },
]
