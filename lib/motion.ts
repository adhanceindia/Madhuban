export const editorialEase = [0.22, 1, 0.36, 1] as const

export function createEditorialMotion(
  reduceMotion: boolean | null | undefined,
) {
  const shouldReduceMotion = Boolean(reduceMotion)

  return {
    sectionVariants: {
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 26 },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0 : 0.65,
          ease: editorialEase,
        },
      },
    },
    containerVariants: {
      hidden: { opacity: 1 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: shouldReduceMotion ? 0 : 0.12,
          delayChildren: shouldReduceMotion ? 0 : 0.06,
        },
      },
    },
    itemVariants: {
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0 : 0.5,
          ease: editorialEase,
        },
      },
    },
  }
}
