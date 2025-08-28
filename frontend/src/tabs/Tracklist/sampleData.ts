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
  imageUrl: string
  previewUrl: string
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
        imageUrl: 'https://picsum.photos/seed/t1/200/200',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
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
        imageUrl: 'https://picsum.photos/seed/t2/200/200',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
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
        imageUrl: 'https://picsum.photos/seed/t3/200/200',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
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
        imageUrl: 'https://picsum.photos/seed/t4/200/200',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
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
        imageUrl: 'https://picsum.photos/seed/t5/200/200',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      },
    ],
  },
]
