ENV ?= dev

BACKEND_CONFIG = environments/$(ENV)/$(ENV).tfbackend

.PHONY: init plan apply destroy fmt validate dev tst prd

init:
	terraform init -backend-config=$(BACKEND_CONFIG)

plan:
	terraform plan -var="environment=$(ENV)"

apply:
	terraform apply -var="environment=$(ENV)"

destroy:
	terraform destroy -var="environment=$(ENV)"

fmt:
	terraform fmt -recursive

validate:
	terraform validate

dev:
	$(MAKE) ENV=dev init
	$(MAKE) ENV=dev apply

tst:
	$(MAKE) ENV=tst init
	$(MAKE) ENV=tst apply

prd:
	$(MAKE) ENV=prd init
	$(MAKE) ENV=prd apply
