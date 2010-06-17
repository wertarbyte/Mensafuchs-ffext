XPI_FILES=$(shell find mensafuchs/ -type f)

mensafuchs.xpi: install.rdf chrome.manifest ${XPI_FILES}
	@zip -r $@ $^ -x '*/.*'

clean:
	@rm mensafuchs.xpi
