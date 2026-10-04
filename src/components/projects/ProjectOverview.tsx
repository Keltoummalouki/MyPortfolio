/**
 * Structured overview shown on a case-study page when the project has no
 * Markdown case study yet: a self-contained identity sentence, the project
 * description and its tech stack in prose. Styled like the Markdown renderer so
 * both variants look the same.
 */
export default function ProjectOverview({
  labels,
  description,
}: {
  labels: {
    overviewTitle: string
    /** "<Project> is a web project built by Keltoum Malouki, …" */
    overviewIntro: string
    stackTitle: string
    /** "<Project> is built with A, B and C." — null when the stack is empty. */
    stackSentence: string | null
  }
  description: string | null
}) {
  return (
    <div className="text-foreground/90">
      <h2 className="mb-3 text-2xl font-bold text-foreground">{labels.overviewTitle}</h2>
      <p className="my-4 leading-relaxed text-foreground/90">{labels.overviewIntro}</p>
      {description && <p className="my-4 leading-relaxed text-foreground/90">{description}</p>}
      {labels.stackSentence && (
        <>
          <h2 className="mt-8 mb-3 text-2xl font-bold text-foreground">{labels.stackTitle}</h2>
          <p className="my-4 leading-relaxed text-foreground/90">{labels.stackSentence}</p>
        </>
      )}
    </div>
  )
}
