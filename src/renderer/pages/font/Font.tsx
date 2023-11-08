export default function Font() {
  return (
    <Content key={font.id} value={font.fullName}>
      <ContentBox>
        <ContentBoxHeader>Preview</ContentBoxHeader>
        <PreviewOptions />
        <StyledPreview id={font.id} name={font.fullName} size={36}>
          {preview.text}
        </StyledPreview>
        <Tables data={fontData?.tables} />
      </ContentBox>
      <ContentBox>
        <ContentBoxHeader>Glyphs</ContentBoxHeader>
        <Glyphs data={fontData} />
      </ContentBox>
    </Content>
  )
}
